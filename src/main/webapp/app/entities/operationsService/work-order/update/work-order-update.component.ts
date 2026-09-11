import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
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

type AccordionPanel = 'global' | 'client' | 'equipes' | 'options' | 'remarque';

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

  constructor(
    protected workOrderService: WorkOrderService,
    protected workOrderFormService: WorkOrderFormService,
    protected activatedRoute: ActivatedRoute,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected siteService: SiteService,
    protected bonCommandeService: BonCommandeService,
    protected workOrderTechniciensService: WorkOrderTechniciensService,
    protected modalService: NgbModal,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadResponsables();
    this.loadTechniciens();
    this.loadAffaires(''); // Pré-charge la liste des projets dès l'ouverture du formulaire

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
    this.selectedTechniciens = techniciens ?? [];
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

    modalRef.result
      .then((contacts: IContactSociete[]) => {
        this.selectedTechniciens = contacts ?? [];
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
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
      this.subscribeToSaveResponse(this.workOrderService.create(workOrder));
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
      next: () => this.previousState(),
      error: () => this.previousState(),
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

    // Libellés Responsable / Coordinateur pour affichage — le formulaire ne persiste que l'id
    const responsableId = workOrder.responsableId;

    if (responsableId !== null && responsableId !== undefined) {
      this.loadResponsableLabel(Number(responsableId));
    }

    const coordinateurId = workOrder.coordinateur;

    if (coordinateurId !== null && coordinateurId !== undefined) {
      this.loadCoordinateurLabel(Number(coordinateurId));
    }

    // Techniciens (sélection multiple) — chargés via la table de liaison
    if (workOrder.id !== null && workOrder.id !== undefined) {
      this.loadAutresTechniciens(workOrder.id);
    }
  }
}
