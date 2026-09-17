import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { WorkOrderFormService, WorkOrderFormGroup } from './work-order-form.service';
import { IWorkOrder } from '../work-order.model';
import { WorkOrderService } from '../service/work-order.service';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { WorkOrderTechniciensService } from '../service/work-order-techniciens.service';
import { forkJoin } from 'rxjs';

import { AffaireSelectorModalComponent } from 'app/entities/financeService/bon-commande/affaire-selector-modal/affaire-selector-modal.component';
import { SiteSelectorModalComponent } from 'app/entities/financeService/bon-commande/site-selector-modal/site-selector-modal.component';
import { ContactSelectorModalComponent } from 'app/entities/financeService/bon-commande/contact-selector-modal/contact-selector-modal.component';
import { IPieceJointe } from 'app/entities/projectService/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/projectService/piece-jointe/service/piece-jointe.service';
import { PjCareService, PjCareDriverInfo, ScanDriver, ScannedPage } from 'app/entities/projectService/piece-jointe/service/pjcare.service';
import { ScanSettingsService } from 'app/entities/projectService/piece-jointe/service/scan-settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs/esm';

type AccordionPanel = 'global' | 'client' | 'equipes' | 'options' | 'remarque' | 'piecesJointes';

interface PendingPieceJointe {
  tempId: string;
  file: File;
  displayName: string;
  extension: string;
}

const AFFAIRE_STATUT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 15;
const RESPONSABLE_ROLE_CODE = 'MANAGER';
const TECHNICIEN_ROLE_CODE = 'TECHNIQUE';

@Component({
  selector: 'jhi-work-order-update',
  templateUrl: './work-order-update.component.html',
  styleUrls: ['./work-order-update.component.scss'],
})
export class WorkOrderUpdateComponent implements OnInit, OnDestroy {
  @ViewChild('clientDetailsModal') clientDetailsModal!: TemplateRef<any>;
  @ViewChild('clientCommandeDetailsModal') clientCommandeDetailsModal!: TemplateRef<any>;

  isSaving = false;
  workOrder: IWorkOrder | null = null;
  statutWOValues = Object.keys(StatutWO);

  // ================================
  // Accordéon (état purement visuel — même pattern que ot-externe-update)
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global']);

  editForm: WorkOrderFormGroup = this.workOrderFormService.createWorkOrderFormGroup();

  // ================================
  // Liste déroulante Affaire (ng-select) — logique identique à ot-externe-update
  // ================================
  affaireResults: IAffaire[] = [];
  selectedAffaire: IAffaire | null = null;
  selectedAffaireCode: string | null = null;

  loadingAffaires = false;
  affaireSearchTerm = '';
  affairePage = 0;
  affaireTotalItems = 0;

  protected readonly affaireSearch$ = new Subject<string>();

  // ================================
  // Information Client — alimentée automatiquement par l'affaire sélectionnée
  // (identique à ot-externe-update : seul clientId est persisté)
  // ================================
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  selectedClientCommandeInfo: IClient | null = null;
  loadingClientCommandeInfo = false;

  // Sites associés au client final — alimente la liste déroulante "Lieu" (identique à ot-externe-update)
  clientSites: ISite[] = [];
  loadingClientSites = false;

  // ================================
  // Liste déroulante Responsable / Coordinateur (contacts ayant le rôle MANAGER)
  // — logique identique au champ Responsable de ot-externe-update, réutilisée pour les 2 champs
  // ================================
  responsables: IContactSociete[] = [];
  selectedResponsable: IContactSociete | null = null;
  selectedCoordinateur: IContactSociete | null = null;
  loadingResponsables = false;

  // ================================
  // Techniciens (sélection multiple, persistée via WorkOrderTechniciens) — même logique
  // que "Autre Responsable" dans ot-externe-update, avec le rôle TECHNIQUE au lieu de MANAGER
  // ================================
  techniciens: IContactSociete[] = [];
  selectedTechniciens: IContactSociete[] = [];
  loadingTechniciens = false;
  technicienError = '';
  private technicienErrorTimeoutId?: ReturnType<typeof setTimeout>;

  // ================================
  // Souscriptions Mission De Nuit / Hebergement (reset du compteur quand désactivé)
  // ================================
  private missionDeNuitSubscription?: Subscription;
  private hebergementSubscription?: Subscription;

  // ================================
  // Pièces Jointes (upload manuel) — même logique que ot-externe-update
  // ================================
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  uploadingPieceJointe = false;

  pendingPieceJointes: PendingPieceJointe[] = [];

  selectedPjForPreview: IPieceJointe | null = null;

  showRenamePjModal = false;
  pjToRename: IPieceJointe | null = null;
  renamePjNewName = '';
  renamePjError = '';
  isRenamingPj = false;

  // ================================
  // Scan PjCare — même logique que ot-externe-update
  // ================================
  pjcareAvailable = false;
  scanners: string[] = [];
  selectedScanner = '';
  scanFormat: 'jpg' | 'png' | 'pdf' | 'tiff' = 'pdf';
  scanDpi = 150;
  scanQuality = 75;
  scanBitdepth: 'color' | 'gray' | 'bw' = 'color';
  scanDuplex = false;
  isScanning = false;
  isMerging = false;
  scanPreview: string | null = null;
  scanError: string | null = null;
  loadingScanners = false;
  availableDrivers: PjCareDriverInfo[] = [];
  selectedDriver: ScanDriver | '' = '';
  loadingDrivers = false;
  scanExcludeBlank = false;
  scanBlankThreshold = 240;
  scanCoverageThreshold = 5;
  currentDocumentPages: ScannedPage[] = [];
  private _pendingDriverFromCookie = '';

  scanAccordionStates: { [key: string]: boolean } = {
    scanSource: true,
    scanParams: true,
  };

  constructor(
    protected workOrderService: WorkOrderService,
    protected workOrderFormService: WorkOrderFormService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected siteService: SiteService,
    protected bonCommandeService: BonCommandeService,
    protected workOrderTechniciensService: WorkOrderTechniciensService,
    protected pieceJointeService: PieceJointeService,
    protected pjCareService: PjCareService,
    protected scanSettingsService: ScanSettingsService,
    protected sanitizer: DomSanitizer,
    protected modalService: NgbModal,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadResponsables();
    this.loadTechniciens();
    this.loadAffaires(''); // Pré-charge la liste des projets dès l'ouverture du formulaire

    // On utilise valueChanges plutôt que (change) dans le template : cela garantit
    // que la valeur du FormControl est déjà à jour au moment où ce code s'exécute,
    // ce qui évite le décalage d'affichage observé avec (change).
    this.missionDeNuitSubscription = this.editForm.get('missionDeNuit')?.valueChanges.subscribe(checked => {
      if (!checked) {
        this.editForm.get('nombreNuits')?.setValue(0, { emitEvent: false });
      }

      this.cdr.detectChanges();
    });

    this.hebergementSubscription = this.editForm.get('hebergement')?.valueChanges.subscribe(checked => {
      if (!checked) {
        this.editForm.get('nombreHebergements')?.setValue(0, { emitEvent: false });
      }

      this.cdr.detectChanges();
    });

    this.activatedRoute.data.subscribe(({ workOrder }) => {
      this.workOrder = workOrder;
      if (workOrder) {
        this.updateForm(workOrder);
      }
    });

    // Recherche avec debounce de 300 ms — identique à ot-externe-update
    this.affaireSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(search => {
          this.affaireSearchTerm = search;
          this.affairePage = 0;
          this.loadingAffaires = true;

          return this.affaireService.findByStatut(AFFAIRE_STATUT, search, {
            page: this.affairePage,
            size: AFFAIRE_PAGE_SIZE,
            sort: ['designationAffaire,asc'],
          });
        })
      )
      .subscribe({
        next: res => this.onAffairePageLoaded(res, true),
        error: () => {
          this.loadingAffaires = false;
          this.affaireResults = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.affaireSearch$.complete();
    this.missionDeNuitSubscription?.unsubscribe();
    this.hebergementSubscription?.unsubscribe();
    if (this.technicienErrorTimeoutId) {
      clearTimeout(this.technicienErrorTimeoutId);
    }
  }

  // ================================
  // Accordéon
  // ================================
  togglePanel(panel: AccordionPanel): void {
    if (this.openPanels.has(panel)) {
      this.openPanels.delete(panel);
    } else {
      this.openPanels.add(panel);
    }
  }

  isPanelOpen(panel: AccordionPanel): boolean {
    return this.openPanels.has(panel);
  }

  // ================================
  // Liste déroulante Affaire (ng-select) — logique identique à ot-externe-update
  // ================================

  onAffaireSearchInput(search: string): void {
    this.affaireSearch$.next(search);
  }

  private loadAffaires(search: string): void {
    this.affairePage = 0;
    this.loadingAffaires = true;

    this.affaireService
      .findByStatut(AFFAIRE_STATUT, search, {
        page: this.affairePage,
        size: AFFAIRE_PAGE_SIZE,
        sort: ['designationAffaire,asc'],
      })
      .subscribe({
        next: res => this.onAffairePageLoaded(res, true),
        error: () => {
          this.loadingAffaires = false;
          this.affaireResults = [];
        },
      });
  }

  onAffaireScrollToEnd(): void {
    const hasMore = this.affaireResults.length < this.affaireTotalItems;

    if (hasMore && !this.loadingAffaires) {
      this.affairePage += 1;
      this.loadingAffaires = true;

      this.affaireService
        .findByStatut(AFFAIRE_STATUT, this.affaireSearchTerm, {
          page: this.affairePage,
          size: AFFAIRE_PAGE_SIZE,
          sort: ['designationAffaire,asc'],
        })
        .subscribe({
          next: res => this.onAffairePageLoaded(res, false),
          error: () => {
            this.loadingAffaires = false;
          },
        });
    }
  }

  compareAffaire = (a: IAffaire | null, b: IAffaire | null): boolean => (a && b ? a.id === b.id : a === b);

  private onAffairePageLoaded(res: HttpResponse<IAffaire[]>, reset: boolean): void {
    const items = res.body ?? [];

    this.affaireTotalItems = Number(res.headers.get('X-Total-Count') ?? items.length);

    this.affaireResults = reset ? items : [...this.affaireResults, ...items];

    this.loadingAffaires = false;
  }

  // ================================
  // Sélection Affaire
  // ================================
  selectAffaire(affaire: IAffaire): void {
    const clientId = affaire.client?.id ?? null;

    this.editForm.patchValue({
      affaireId: affaire.id,
      clientId,
    });

    this.selectedAffaire = affaire;
    this.selectedAffaireCode = affaire.identifiantUnique ?? null;

    this.loadClientInfo(clientId);
    this.loadClientCommandeInfo(affaire.clientCommande ?? null);
    this.applyResponsableFromAffaire(affaire);
  }

  /**
   * Pré-remplit le champ "Responsable" du work order avec le responsable
   * projet déjà défini sur l'affaire sélectionnée (IAffaire.responsableProjetId),
   * en le proposant comme valeur par défaut (l'utilisateur peut ensuite la changer).
   */
  private applyResponsableFromAffaire(affaire: IAffaire): void {
    const responsableProjetId = (affaire as any).responsableProjetId;

    if (responsableProjetId === null || responsableProjetId === undefined || responsableProjetId === '') {
      return;
    }

    const parsedId = Number(responsableProjetId);
    if (Number.isNaN(parsedId)) {
      return;
    }

    this.bonCommandeService.findResponsableById(parsedId).subscribe({
      next: res => {
        const contact = res.body ?? null;
        if (contact) {
          this.onResponsableSelectChange(contact);
        }
      },
    });
  }

  onAffaireSelectChange(affaire: IAffaire | null): void {
    if (affaire) {
      this.selectAffaire(affaire);
    } else {
      this.editForm.patchValue({ affaireId: null, clientId: null, lieu: null });
      this.selectedAffaire = null;
      this.selectedAffaireCode = null;
      this.selectedClientInfo = null;
      this.selectedClientCommandeInfo = null;
      this.clientSites = [];
    }
  }

  private loadClientInfo(clientId: number | null): void {
    this.selectedClientInfo = null;

    if (clientId === null || clientId === undefined) {
      this.clientSites = [];
      return;
    }

    this.loadingClientInfo = true;

    this.clientService.find(clientId).subscribe({
      next: res => {
        this.selectedClientInfo = res.body ?? null;
        this.loadingClientInfo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedClientInfo = null;
        this.loadingClientInfo = false;
        this.cdr.detectChanges();
      },
    });

    this.loadClientSites(clientId);
  }

  /**
   * Récupère les sites associés au client final (GET /api/sites/client/{clientId}),
   * pour alimenter la liste déroulante "Lieu" (identique à ot-externe-update).
   */
  private loadClientSites(clientId: number): void {
    this.clientSites = [];
    this.loadingClientSites = true;

    this.siteService.findByClientId(clientId).subscribe({
      next: res => {
        this.clientSites = res.body ?? [];
        this.loadingClientSites = false;
      },
      error: () => {
        this.clientSites = [];
        this.loadingClientSites = false;
      },
    });
  }

  private loadClientCommandeInfo(clientCommandeId: number | null): void {
    this.selectedClientCommandeInfo = null;

    if (clientCommandeId === null || clientCommandeId === undefined) {
      return;
    }

    this.loadingClientCommandeInfo = true;

    this.clientService.find(clientCommandeId).subscribe({
      next: res => {
        this.selectedClientCommandeInfo = res.body ?? null;
        this.loadingClientCommandeInfo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedClientCommandeInfo = null;
        this.loadingClientCommandeInfo = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ================================
  // Liste déroulante Responsable (contacts ayant le rôle MANAGER) — identique à ot-externe-update
  // ================================
  private loadResponsables(): void {
    this.loadingResponsables = true;

    this.bonCommandeService.findResponsablesByRole(RESPONSABLE_ROLE_CODE).subscribe({
      next: res => {
        this.responsables = res.body ?? [];
        this.loadingResponsables = false;
      },
      error: () => {
        this.responsables = [];
        this.loadingResponsables = false;
      },
    });
  }

  onResponsableSelectChange(responsable: IContactSociete | null): void {
    this.editForm.patchValue({
      responsableId: responsable?.id ?? null,
    });

    this.selectedResponsable = responsable;
  }

  onCoordinateurSelectChange(coordinateur: IContactSociete | null): void {
    this.editForm.patchValue({
      coordinateur: coordinateur?.id ?? null,
    });

    this.selectedCoordinateur = coordinateur;
  }

  compareResponsable = (a: IContactSociete | null, b: IContactSociete | null): boolean => (a && b ? a.id === b.id : a === b);

  private loadResponsableLabel(responsableId: number): void {
    this.bonCommandeService.findResponsableById(responsableId).subscribe({
      next: res => {
        this.selectedResponsable = res.body ?? null;
      },
    });
  }

  // ================================
  // Steppers Mission De Nuit / Hebergement
  // ================================
  incrementNombreNuits(): void {
    this.incrementCounter('nombreNuits');
  }

  decrementNombreNuits(): void {
    this.decrementCounter('nombreNuits');
  }

  incrementNombreHebergements(): void {
    this.incrementCounter('nombreHebergements');
  }

  decrementNombreHebergements(): void {
    this.decrementCounter('nombreHebergements');
  }

  private incrementCounter(controlName: 'nombreNuits' | 'nombreHebergements'): void {
    const control = this.editForm.get(controlName);
    const current = control?.value ?? 0;
    control?.setValue(current + 1);
    control?.markAsDirty();
  }

  private decrementCounter(controlName: 'nombreNuits' | 'nombreHebergements'): void {
    const control = this.editForm.get(controlName);
    const current = control?.value ?? 0;
    if (current > 0) {
      control?.setValue(current - 1);
      control?.markAsDirty();
    }
  }

  private loadCoordinateurLabel(coordinateurId: number): void {
    this.bonCommandeService.findResponsableById(coordinateurId).subscribe({
      next: res => {
        this.selectedCoordinateur = res.body ?? null;
      },
    });
  }

  // ================================
  // Techniciens (sélection multiple, persistée via WorkOrderTechniciens)
  // ================================
  private loadTechniciens(): void {
    this.loadingTechniciens = true;

    this.bonCommandeService.findResponsablesByRole(TECHNICIEN_ROLE_CODE).subscribe({
      next: res => {
        this.techniciens = res.body ?? [];
        this.loadingTechniciens = false;
      },
      error: () => {
        this.techniciens = [];
        this.loadingTechniciens = false;
      },
    });
  }

  onTechnicienSelectChange(techniciens: IContactSociete[] | null): void {
    const nouvelleListe = techniciens ?? [];
    const ancienneListe = this.selectedTechniciens;
    const ajouts = nouvelleListe.filter(t => !ancienneListe.some(a => a.id === t.id));

    // On applique déjà la nouvelle liste (optimiste), on corrigera en cas de conflit
    this.selectedTechniciens = nouvelleListe;

    if (ajouts.length === 0) {
      return;
    }

    const idsAjoutes = ajouts.map(t => t.id).filter((id): id is number => id !== null && id !== undefined);

    this.workOrderTechniciensService.checkDisponibilite(idsAjoutes, this.workOrder?.id ?? null).subscribe({
      next: res => {
        const conflicts = res.body ?? [];
        if (conflicts.length === 0) {
          return;
        }

        const idsEnConflit = conflicts.map(c => c.contactSocieteId);
        this.selectedTechniciens = this.selectedTechniciens.filter(t => !idsEnConflit.includes(t.id!));

        const messages = conflicts.map(conflict => {
          const technicien = ajouts.find(t => t.id === conflict.contactSocieteId);
          const nom = technicien?.nomPrenom ?? 'Ce technicien';
          const dateFin = conflict.dateHeureFinPrev ? new Date(conflict.dateHeureFinPrev).toLocaleString() : '';

          return `${nom} est déjà affecté au work order ${
            conflict.numFicheIntervention ?? conflict.workOrderId
          } (mission en cours jusqu'au ${dateFin}).`;
        });

        this.showTechnicienError(messages.join('\n'));
      },
    });
  }

  private showTechnicienError(message: string): void {
    this.technicienError = message;

    if (this.technicienErrorTimeoutId) {
      clearTimeout(this.technicienErrorTimeoutId);
    }

    this.technicienErrorTimeoutId = setTimeout(() => {
      this.technicienError = '';
      this.technicienErrorTimeoutId = undefined;
    }, 4000);
  }

  private loadAutresTechniciens(workOrderId: number): void {
    this.workOrderTechniciensService.findByWorkOrder(workOrderId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const contactIds = links.map(l => l.contactSocieteId).filter((id): id is number => id !== null && id !== undefined);

        if (contactIds.length === 0) {
          this.selectedTechniciens = [];
          return;
        }

        forkJoin(contactIds.map(id => this.bonCommandeService.findResponsableById(id))).subscribe({
          next: responses => {
            this.selectedTechniciens = responses.map(r => r.body).filter((c): c is IContactSociete => c !== null);
          },
        });
      },
      error: () => {
        this.selectedTechniciens = [];
      },
    });
  }

  openTechnicienModal(): void {
    const modalRef = this.modalService.open(ContactSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'contact-selector-modal-window',
    });

    modalRef.componentInstance.roleCode = TECHNICIEN_ROLE_CODE;
    modalRef.componentInstance.modalTitle = 'Sélectionner un ou plusieurs techniciens';
    modalRef.componentInstance.multiple = true;
    modalRef.componentInstance.initialSelection = this.selectedTechniciens;
    modalRef.componentInstance.checkDisponibilite = true;
    modalRef.componentInstance.excludeWorkOrderId = this.workOrder?.id ?? null;

    modalRef.result
      .then((contacts: IContactSociete[]) => {
        this.selectedTechniciens = contacts ?? [];
      })
      .catch(() => {});
  }

  openResponsableModal(): void {
    const modalRef = this.modalService.open(ContactSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'contact-selector-modal-window',
    });

    modalRef.componentInstance.roleCode = RESPONSABLE_ROLE_CODE;
    modalRef.componentInstance.modalTitle = 'Sélectionner un responsable';

    modalRef.result
      .then((contact: IContactSociete) => {
        if (contact) {
          this.onResponsableSelectChange(contact);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  openCoordinateurModal(): void {
    const modalRef = this.modalService.open(ContactSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'contact-selector-modal-window',
    });

    modalRef.componentInstance.roleCode = RESPONSABLE_ROLE_CODE;
    modalRef.componentInstance.modalTitle = 'Sélectionner un coordinateur';

    modalRef.result
      .then((contact: IContactSociete) => {
        if (contact) {
          this.onCoordinateurSelectChange(contact);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  openLieuModal(): void {
    const modalRef = this.modalService.open(SiteSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'site-selector-modal-window',
    });

    modalRef.componentInstance.clientId = this.editForm.get('clientId')?.value ?? null;

    modalRef.result
      .then((site: ISite) => {
        if (site) {
          this.editForm.patchValue({ lieu: site.designation });
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  // ================================
  // Détails Client / Client Demandeur (modals)
  // ================================
  openClientDetailsModal(): void {
    this.modalService.open(this.clientDetailsModal, { size: 'md', centered: true });
  }

  openClientCommandeDetailsModal(): void {
    this.modalService.open(this.clientCommandeDetailsModal, { size: 'md', centered: true });
  }

  // ================================
  // Modal de sélection Affaire
  // ================================
  openAffaireModal(): void {
    const modalRef = this.modalService.open(AffaireSelectorModalComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'affaire-selector-modal-window',
    });

    modalRef.componentInstance.statut = AFFAIRE_STATUT;

    modalRef.result
      .then((affaire: IAffaire) => {
        if (affaire) {
          this.selectAffaire(affaire);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const workOrder = this.workOrderFormService.getWorkOrder(this.editForm);

    if (workOrder.id !== null) {
      this.subscribeToSaveResponse(this.workOrderService.update(workOrder));
    } else {
      this.workOrderService.generateIdentifiantWorkOrder().subscribe({
        next: res => {
          workOrder.identifiantUnique = res.body;
          this.subscribeToSaveResponse(this.workOrderService.create(workOrder));
        },
        error: () => {
          this.onSaveFinalize();
        },
      });
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWorkOrder>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: response => this.onSaveSuccess(response.body),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(workOrder?: IWorkOrder | null): void {
    const workOrderId = workOrder?.id;

    if (workOrderId === null || workOrderId === undefined) {
      this.previousState();
      return;
    }

    const contactSocieteIds = this.selectedTechniciens.map(c => c.id).filter((id): id is number => id !== null && id !== undefined);

    this.workOrderTechniciensService.replaceForWorkOrder(workOrderId, contactSocieteIds).subscribe({
      next: () => this.uploadPendingPieceJointesThenNavigate(workOrderId),
      error: () => this.uploadPendingPieceJointesThenNavigate(workOrderId),
    });
  }

  /**
   * Envoie les pièces jointes mises en attente juste après le premier enregistrement
   * du work order (qui vient de recevoir son id) — même logique que ot-externe-update.
   */
  private uploadPendingPieceJointesThenNavigate(workOrderId: number): void {
    if (this.pendingPieceJointes.length === 0) {
      this.previousState();
      return;
    }

    const uploads = this.pendingPieceJointes.map(p =>
      this.pieceJointeService.uploadPieceJointeWorkOrder(p.file, workOrderId, this.generateRandomId(10))
    );

    forkJoin(uploads).subscribe({
      next: () => {
        this.pendingPieceJointes = [];
        this.previousState();
      },
      error: () => {
        alert("Certaines pièces jointes n'ont pas pu être envoyées. Vous pouvez réessayer depuis l'accordéon Pièces Jointes.");
        this.previousState();
      },
    });
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(workOrder: IWorkOrder): void {
    this.workOrder = workOrder;

    this.workOrderFormService.resetForm(this.editForm, workOrder);

    // Force immédiatement Angular à mettre à jour l'affichage
    // des switches et des steppers.
    this.cdr.detectChanges();

    // ================================
    // Pré-remplissage Affaire + Information Client (mode édition)
    // ================================
    const affaireId = workOrder.affaireId;

    if (affaireId !== null && affaireId !== undefined) {
      this.affaireService.find(affaireId).subscribe({
        next: res => {
          const affaire = res.body;

          if (affaire) {
            this.selectedAffaire = affaire;
            this.selectedAffaireCode = affaire.identifiantUnique ?? null;

            if (!this.affaireResults.some(a => a.id === affaire.id)) {
              this.affaireResults = [affaire, ...this.affaireResults];
            }

            this.cdr.detectChanges();

            this.loadClientCommandeInfo(affaire.clientCommande ?? null);
          }
        },
      });
    }

    const clientId = workOrder.clientId;

    if (clientId !== null && clientId !== undefined) {
      this.loadClientInfo(Number(clientId));
    }

    // Libellés Responsable / Coordinateur
    const responsableId = workOrder.responsableId;

    if (responsableId !== null && responsableId !== undefined) {
      this.loadResponsableLabel(Number(responsableId));
    }

    const coordinateurId = workOrder.coordinateur;

    if (coordinateurId !== null && coordinateurId !== undefined) {
      this.loadCoordinateurLabel(Number(coordinateurId));
    }

    // Techniciens
    if (workOrder.id !== null && workOrder.id !== undefined) {
      this.loadAutresTechniciens(workOrder.id);
      this.loadPieceJointes(workOrder.id);
    }
  }

  // ================================
  // Pièces Jointes — chargement, upload — même logique que ot-externe-update
  // ================================
  private loadPieceJointes(workOrderId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findByWorkOrder(workOrderId).subscribe({
      next: res => {
        this.pieceJointes = res.body ?? [];
        this.loadingPieceJointes = false;
      },
      error: () => {
        this.pieceJointes = [];
        this.loadingPieceJointes = false;
      },
    });
  }

  removePieceJointe(id: number): void {
    this.pieceJointeService.delete(id).subscribe({
      next: () => {
        this.pieceJointes = this.pieceJointes.filter(pj => pj.id !== id);
      },
    });
  }

  getPieceJointeFileUrl(id: number): string {
    return this.pieceJointeService.getFileUrl(id);
  }

  downloadPieceJointe(pj: IPieceJointe): void {
    this.pieceJointeService.getFile(pj.id).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, pj.nomFichier + '.' + pj.type);
      },
      error: err => {
        console.error('Download failed', err);
        alert('Échec du téléchargement du fichier');
      },
    });
  }

  openRenamePjModal(pj: IPieceJointe): void {
    this.pjToRename = pj;
    this.renamePjNewName = pj.nomFichier || '';
    this.renamePjError = '';
    this.showRenamePjModal = true;
  }

  closeRenamePjModal(): void {
    if (this.isRenamingPj) {
      return;
    }
    this.showRenamePjModal = false;
    this.pjToRename = null;
    this.renamePjNewName = '';
    this.renamePjError = '';
  }

  confirmRenamePj(): void {
    if (!this.pjToRename) {
      return;
    }

    const trimmed = (this.renamePjNewName || '').trim();
    if (!trimmed) {
      this.renamePjError = 'Le nom ne peut pas être vide';
      return;
    }

    this.isRenamingPj = true;
    this.renamePjError = '';

    this.pieceJointeService.renamePieceJointe(this.pjToRename.id, trimmed).subscribe({
      next: () => {
        this.isRenamingPj = false;
        const idx = this.pieceJointes.findIndex(p => p.id === this.pjToRename!.id);
        if (idx >= 0) {
          this.pieceJointes[idx] = { ...this.pieceJointes[idx], nomFichier: trimmed };
        }
        if (this.selectedPjForPreview?.id === this.pjToRename!.id) {
          this.selectedPjForPreview = { ...this.selectedPjForPreview, nomFichier: trimmed };
        }
        this.closeRenamePjModal();
      },
      error: err => {
        this.isRenamingPj = false;
        console.error('Erreur renommage PJ', err);
        this.renamePjError = 'Erreur lors du renommage';
      },
    });
  }

  togglePjPreview(pj: IPieceJointe): void {
    if (this.selectedPjForPreview && this.selectedPjForPreview.id === pj.id) {
      this.selectedPjForPreview = null;
    } else {
      this.selectedPjForPreview = pj;
    }
  }

  closePjPreview(): void {
    this.selectedPjForPreview = null;
  }

  isImagePj(pj: IPieceJointe): boolean {
    const t = (pj.type || '').toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(t);
  }

  isPdfPj(pj: IPieceJointe): boolean {
    return (pj.type || '').toLowerCase() === 'pdf';
  }

  getSafePjUrl(id: number): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getPieceJointeFileUrl(id));
  }

  private generateRandomId(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) {
      return;
    }
    this.uploadFile(file);
    event.target.value = '';
  }

  private uploadFile(file: File): void {
    const workOrderId = this.workOrder?.id;

    if (workOrderId === null || workOrderId === undefined) {
      this.stagePendingPieceJointe(file);
      return;
    }

    const uniqueName = this.generateRandomId(10);
    this.uploadingPieceJointe = true;

    this.pieceJointeService.uploadPieceJointeWorkOrder(file, workOrderId, uniqueName).subscribe({
      next: pj => {
        this.pieceJointes = [pj, ...this.pieceJointes];
        this.uploadingPieceJointe = false;
      },
      error: () => {
        this.uploadingPieceJointe = false;
        alert('Échec du téléchargement du fichier');
      },
    });
  }

  private stagePendingPieceJointe(file: File): void {
    const lastDot = file.name.lastIndexOf('.');
    const displayName = lastDot > 0 ? file.name.substring(0, lastDot) : file.name;
    const extension = lastDot > 0 ? file.name.substring(lastDot + 1) : '';

    this.pendingPieceJointes = [{ tempId: this.generateRandomId(10), file, displayName, extension }, ...this.pendingPieceJointes];
  }

  removePendingPieceJointe(tempId: string): void {
    this.pendingPieceJointes = this.pendingPieceJointes.filter(p => p.tempId !== tempId);
  }

  // ================================
  // Scan PjCare — même logique que ot-externe-update
  // ================================
  openScanModal(content: any): void {
    this.scanPreview = null;
    this.scanError = null;
    this.isMerging = false;
    this.currentDocumentPages = [];

    const hasSavedSettings = this.scanSettingsService.hasSettings();
    this.scanAccordionStates['scanSource'] = !hasSavedSettings;
    this.scanAccordionStates['scanParams'] = !hasSavedSettings;

    this.loadScanSettings();
    this.checkPjCare();
    this.modalService.open(content, { size: 'lg', windowClass: 'scan-modal-window' });
  }

  private loadScanSettings(): void {
    const s = this.scanSettingsService.load();
    this.scanFormat = s.scanFormat;
    this.scanDpi = s.scanDpi;
    this.scanQuality = s.scanQuality;
    this.scanBitdepth = s.scanBitdepth;
    this.scanDuplex = s.scanDuplex;
    this.scanExcludeBlank = s.scanExcludeBlank;
    this.scanBlankThreshold = s.scanBlankThreshold;
    this.scanCoverageThreshold = s.scanCoverageThreshold;
    this._pendingDriverFromCookie = s.selectedDriver;
  }

  saveScanSettings(): void {
    this.scanSettingsService.save({
      scanFormat: this.scanFormat,
      scanDpi: this.scanDpi,
      scanQuality: this.scanQuality,
      scanBitdepth: this.scanBitdepth,
      scanDuplex: this.scanDuplex,
      scanExcludeBlank: this.scanExcludeBlank,
      scanBlankThreshold: this.scanBlankThreshold,
      scanCoverageThreshold: this.scanCoverageThreshold,
      selectedDriver: this.selectedDriver as string,
    });
  }

  resetScanSettings(): void {
    this.scanSettingsService.reset();
    this.scanFormat = 'pdf';
    this.scanDpi = 150;
    this.scanQuality = 75;
    this.scanBitdepth = 'color';
    this.scanDuplex = false;
    this.scanExcludeBlank = false;
    this.scanBlankThreshold = 240;
    this.scanCoverageThreshold = 5;
  }

  checkPjCare(): void {
    this.loadingScanners = true;
    this.loadingDrivers = true;

    this.pjCareService.getHealth().subscribe({
      next: res => {
        if (res && res.status === 200) {
          this.pjcareAvailable = true;
          this.pjCareService.getDrivers().subscribe({
            next: driverRes => {
              this.availableDrivers = driverRes.drivers || [];
              const defaultKey = res.defaultDriver || (this.availableDrivers[0]?.key ?? '');

              const cookieDriver = this._pendingDriverFromCookie;
              const cookieDriverExists = cookieDriver ? this.availableDrivers.some(d => d.key === cookieDriver) : false;

              this.selectedDriver = (cookieDriverExists ? cookieDriver : defaultKey) as ScanDriver;
              this._pendingDriverFromCookie = '';
              this.loadingDrivers = false;
              this.loadScannersForDriver(this.selectedDriver as ScanDriver);
            },
            error: () => {
              this.availableDrivers = [];
              this.loadingDrivers = false;
              this.loadScannersForDriver(undefined);
            },
          });
        } else {
          this.pjcareAvailable = false;
          this.loadingScanners = false;
          this.loadingDrivers = false;
        }
      },
      error: () => {
        this.pjcareAvailable = false;
        this.loadingScanners = false;
        this.loadingDrivers = false;
      },
    });
  }

  loadScannersForDriver(driver?: ScanDriver): void {
    this.loadingScanners = true;
    this.scanners = [];
    this.selectedScanner = '';

    this.pjCareService.getScanners(driver).subscribe({
      next: scanRes => {
        this.scanners = scanRes.scanners || [];
        if (this.scanners.length > 0) {
          this.selectedScanner = this.scanners[0];
        }
        this.loadingScanners = false;
      },
      error: () => {
        this.scanners = [];
        this.loadingScanners = false;
      },
    });
  }

  onDriverChange(): void {
    this.scanPreview = null;
    this.scanError = null;
    this.loadScannersForDriver((this.selectedDriver as ScanDriver) || undefined);
  }

  launchScan(): void {
    this.isScanning = true;
    this.scanError = null;
    this.scanPreview = null;

    this.saveScanSettings();

    this.pjCareService
      .scan({
        source: this.selectedScanner,
        driver: (this.selectedDriver as ScanDriver) || undefined,
        format: this.scanFormat as any,
        dpi: this.scanDpi,
        jpegquality: this.scanQuality,
        bitdepth: this.scanBitdepth,
        duplex: this.scanDuplex,
        name: 'work-order',
        excludeBlank: this.scanExcludeBlank,
        blankThreshold: this.scanBlankThreshold,
        coverageThreshold: this.scanCoverageThreshold,
      })
      .subscribe({
        next: result => {
          this.isScanning = false;
          if (result.status === 200) {
            const preview = this.scanFormat !== 'pdf' ? `data:image/${this.scanFormat};base64,${result.data}` : null;
            this.scanPreview = preview ?? 'pdf';

            const page: ScannedPage = {
              data: result.data,
              format: result.format || this.scanFormat,
              preview,
              pageNumber: this.currentDocumentPages.length + 1,
            };
            this.currentDocumentPages.push(page);
          } else {
            this.scanError = result.error || 'Erreur inconnue';
          }
        },
        error: () => {
          this.isScanning = false;
          this.scanError = 'PjCare inaccessible. Vérifiez que le service tourne.';
        },
      });
  }

  removePage(index: number): void {
    this.currentDocumentPages.splice(index, 1);
    this.currentDocumentPages.forEach((p, i) => (p.pageNumber = i + 1));
    if (this.currentDocumentPages.length === 0) {
      this.scanPreview = null;
    }
  }

  attachScanResult(modal: any): void {
    if (this.currentDocumentPages.length === 0) {
      return;
    }

    if (this.currentDocumentPages.length === 1) {
      const p = this.currentDocumentPages[0];
      this._attachRawResult(p.data, this.scanFormat, modal);
      return;
    }

    this.isMerging = true;
    this.scanError = null;

    this.pjCareService
      .mergePages({
        pages: this.currentDocumentPages.map(p => ({ data: p.data, format: p.format })),
        outputFormat: this.scanFormat as any,
        jpegquality: this.scanQuality,
        name: 'work-order',
      })
      .subscribe({
        next: result => {
          this.isMerging = false;
          if (result.status === 200) {
            this._attachRawResult(result.data, result.format, modal);
          } else {
            this.scanError = result.error || 'Erreur lors de la fusion des pages';
          }
        },
        error: () => {
          this.isMerging = false;
          this.scanError = 'Erreur lors de la fusion des pages';
        },
      });
  }

  private _attachRawResult(base64: string, format: string, modal: any): void {
    const mimeType = format === 'pdf' ? 'application/pdf' : `image/${format}`;
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const filename = `scan-${dayjs().format('YYYYMMDD-HHmmss')}.${format}`;
    const file = new File([blob], filename, { type: mimeType });

    this.uploadFile(file);

    this.currentDocumentPages = [];
    this.scanPreview = null;
    modal.close();
  }
}
