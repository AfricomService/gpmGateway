import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { OtExterneFormService, OtExterneFormGroup } from './ot-externe-form.service';
import { IOtExterne } from '../ot-externe.model';
import { OtExterneService } from '../service/ot-externe.service';
import { StatutOtExterne } from 'app/entities/enumerations/statut-ot-externe.model';

import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';
import { IBonCommande } from 'app/entities/financeService/bon-commande/bon-commande.model';

import { AffaireSelectorModalComponent } from 'app/entities/financeService/bon-commande/affaire-selector-modal/affaire-selector-modal.component';
import { SiteSelectorModalComponent } from 'app/entities/financeService/bon-commande/site-selector-modal/site-selector-modal.component';
import { ContactSelectorModalComponent } from 'app/entities/financeService/bon-commande/contact-selector-modal/contact-selector-modal.component';
import { BonCommandeSelectorModalComponent } from '../bon-commande-selector-modal/bon-commande-selector-modal.component';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { OtExterneAutreResponsableService } from '../service/ot-externe-autre-responsable.service';
import { forkJoin } from 'rxjs';

type ModeCreation = 'MODELE' | 'LIBRE';
type AccordionPanel = 'global' | 'mode' | 'modele' | 'client';

const AFFAIRE_STATUT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 15;
const RESPONSABLE_ROLE_CODE = 'MANAGER';
const BON_COMMANDE_STATUT = 'ACTIF';

@Component({
  selector: 'jhi-ot-externe-update',
  templateUrl: './ot-externe-update.component.html',
  styleUrls: ['./ot-externe-update.component.scss'],
})
export class OtExterneUpdateComponent implements OnInit, OnDestroy {
  @ViewChild('clientDetailsModal') clientDetailsModal!: TemplateRef<any>;
  @ViewChild('clientCommandeDetailsModal') clientCommandeDetailsModal!: TemplateRef<any>;

  isSaving = false;
  otExterne: IOtExterne | null = null;
  statutOtExterneValues = Object.keys(StatutOtExterne);

  selectedBonCommande: IBonCommande | null = null;

  modeCreation: ModeCreation = 'MODELE';

  // ================================
  // Accordéon (état purement visuel — même pattern que bon-commande-update)
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global', 'mode']);

  editForm: OtExterneFormGroup = this.otExterneFormService.createOtExterneFormGroup();

  // ================================
  // Liste déroulante Affaire (ng-select) — logique identique à bon-commande-update
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
  // (identique à bon-commande-update : seul clientId est persisté)
  // ================================
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  selectedClientCommandeInfo: IClient | null = null;
  loadingClientCommandeInfo = false;

  // Sites associés au client final — alimente la liste déroulante "Lieu" (identique à bon-commande-update)
  clientSites: ISite[] = [];
  loadingClientSites = false;

  // ================================
  // Liste déroulante Responsable (contacts ayant le rôle MANAGER) — identique à bon-commande-update
  // ================================
  responsables: IContactSociete[] = [];
  selectedResponsable: IContactSociete | null = null;
  loadingResponsables = false;

  // Autres Responsables (sélection multiple, persistée via OtExterneAutreResponsable)
  selectedAutresResponsables: IContactSociete[] = [];

  constructor(
    protected otExterneService: OtExterneService,
    protected otExterneFormService: OtExterneFormService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected siteService: SiteService,
    protected bonCommandeService: BonCommandeService,
    protected otExterneAutreResponsableService: OtExterneAutreResponsableService,
    protected modalService: NgbModal,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadResponsables();
    this.loadAffaires(''); // Pré-charge la liste des projets dès l'ouverture du formulaire

    this.activatedRoute.data.subscribe(({ otExterne }) => {
      this.otExterne = otExterne;
      if (otExterne) {
        this.updateForm(otExterne);
      }
    });

    // Recherche avec debounce de 300 ms — identique à bon-commande-update
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

  selectModeCreation(mode: ModeCreation): void {
    this.modeCreation = mode;
    if (mode === 'LIBRE') {
      this.editForm.patchValue({ modeleOtId: null });
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const otExterne = this.otExterneFormService.getOtExterne(this.editForm);

    if (otExterne.id !== null) {
      this.subscribeToSaveResponse(this.otExterneService.update(otExterne));
    } else {
      this.otExterneService.generateIdentifiantOtExterne().subscribe({
        next: res => {
          otExterne.reference = res.body;
          this.subscribeToSaveResponse(this.otExterneService.create(otExterne));
        },
        error: () => {
          this.onSaveFinalize();
        },
      });
    }
  }

  // ================================
  // Liste déroulante Affaire (ng-select) — logique identique à bon-commande-update
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
      this.selectedBonCommande = null;
      this.editForm.patchValue({ bonCommandeId: null });
      // Note : contrairement à bon-commande-update, on ne réinitialise pas responsableId
      // ni selectedAutresResponsables ici, car ce ne sont pas des champs dépendants de l'affaire.
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
   * pour alimenter la liste déroulante "Lieu" (identique à bon-commande-update).
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
  // Liste déroulante Responsable
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
      responsableId: responsable?.id !== undefined && responsable?.id !== null ? String(responsable.id) : null,
    });

    this.selectedResponsable = responsable;
  }

  // ================================
  // Autres Responsables (sélection multiple, persistée via OtExterneAutreResponsable)
  // ================================
  onAutreResponsableSelectChange(responsables: IContactSociete[] | null): void {
    this.selectedAutresResponsables = responsables ?? [];
  }

  compareResponsable = (a: IContactSociete | null, b: IContactSociete | null): boolean => (a && b ? a.id === b.id : a === b);

  private loadResponsableLabel(responsableId: number): void {
    this.bonCommandeService.findResponsableById(responsableId).subscribe({
      next: res => {
        this.selectedResponsable = res.body ?? null;
      },
    });
  }

  private loadAutresResponsables(otExterneId: number): void {
    this.otExterneAutreResponsableService.findByOtExterne(otExterneId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const contactIds = links.map(l => l.contactSocieteId).filter((id): id is number => id !== null && id !== undefined);

        if (contactIds.length === 0) {
          this.selectedAutresResponsables = [];
          return;
        }

        forkJoin(contactIds.map(id => this.bonCommandeService.findResponsableById(id))).subscribe({
          next: responses => {
            this.selectedAutresResponsables = responses.map(r => r.body).filter((c): c is IContactSociete => c !== null);
          },
        });
      },
      error: () => {
        this.selectedAutresResponsables = [];
      },
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

  openAutreResponsableModal(): void {
    const modalRef = this.modalService.open(ContactSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'contact-selector-modal-window',
    });

    modalRef.componentInstance.roleCode = RESPONSABLE_ROLE_CODE;
    modalRef.componentInstance.modalTitle = 'Sélectionner un autre responsable';
    modalRef.componentInstance.multiple = true;
    modalRef.componentInstance.initialSelection = this.selectedAutresResponsables;

    modalRef.result
      .then((contacts: IContactSociete[]) => {
        this.selectedAutresResponsables = contacts ?? [];
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
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

  openBonCommandeModal(): void {
    const affaireId = this.editForm.get('affaireId')?.value ?? null;

    const modalRef = this.modalService.open(BonCommandeSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'bon-commande-selector-modal-window',
    });

    modalRef.componentInstance.affaireId = affaireId;
    modalRef.componentInstance.statut = BON_COMMANDE_STATUT;

    modalRef.result
      .then((bonCommande: IBonCommande) => {
        if (bonCommande) {
          this.selectedBonCommande = bonCommande;
          this.editForm.patchValue({ bonCommandeId: bonCommande.id });
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

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOtExterne>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: response => this.onSaveSuccess(response.body),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(otExterne?: IOtExterne | null): void {
    const otExterneId = otExterne?.id;

    if (otExterneId === null || otExterneId === undefined) {
      this.previousState();
      return;
    }

    const contactSocieteIds = this.selectedAutresResponsables.map(c => c.id).filter((id): id is number => id !== null && id !== undefined);

    this.otExterneAutreResponsableService.replaceForOtExterne(otExterneId, contactSocieteIds).subscribe({
      next: () => this.router.navigate(['../', otExterneId, 'edit'], { relativeTo: this.activatedRoute }),
      error: () => this.router.navigate(['../', otExterneId, 'edit'], { relativeTo: this.activatedRoute }),
    });
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(otExterne: IOtExterne): void {
    this.otExterne = otExterne;
    this.otExterneFormService.resetForm(this.editForm, otExterne);
    // Si l'OT a déjà un modèle associé (via un futur champ modeleOtId), on force le mode "MODELE"
    this.modeCreation = (otExterne as any).modeleOtId ? 'MODELE' : this.modeCreation;

    // ================================
    // Pré-remplissage Affaire + Information Client (mode édition)
    // ================================
    const affaireId = (otExterne as any).affaireId;

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

    const clientId = (otExterne as any).clientId;

    if (clientId !== null && clientId !== undefined) {
      this.loadClientInfo(Number(clientId));
    }

    // Libellé du responsable pour affichage — le formulaire ne persiste que l'id
    const responsableId = otExterne.responsableId;

    if (responsableId !== null && responsableId !== undefined && responsableId !== '') {
      this.loadResponsableLabel(Number(responsableId));
    }

    // Autres responsables (sélection multiple) — chargés via la table de liaison
    if (otExterne.id !== null && otExterne.id !== undefined) {
      this.loadAutresResponsables(otExterne.id);
    }

    // Libellé du bon de commande déjà lié — affichage uniquement
    const bonCommandeId = otExterne.bonCommandeId;

    if (bonCommandeId !== null && bonCommandeId !== undefined) {
      this.bonCommandeService.find(bonCommandeId).subscribe({
        next: res => {
          this.selectedBonCommande = res.body ?? null;
        },
      });
    }
  }
}
