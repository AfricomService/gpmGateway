import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { BonCommandeFormService, BonCommandeFormGroup } from './bon-commande-form.service';
import { IBonCommande } from '../bon-commande.model';
import { BonCommandeService } from '../service/bon-commande.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { AffaireSelectorModalComponent } from '../affaire-selector-modal/affaire-selector-modal.component';
import { ContactSelectorModalComponent } from '../contact-selector-modal/contact-selector-modal.component';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';

type AccordionPanel = 'global' | 'client' | 'detailsCommande' | 'otAssocies' | 'articlesMissions' | 'piecesJointes';

const AFFAIRE_STATUT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 15;
const RESPONSABLE_ROLE_CODE = 'MANAGER';

@Component({
  selector: 'jhi-bon-commande-update',
  templateUrl: './bon-commande-update.component.html',
  styleUrls: ['./bon-commande-update.component.scss'],
})
export class BonCommandeUpdateComponent implements OnInit, OnDestroy {
  isSaving = false;
  bonCommande: IBonCommande | null = null;

  editForm: BonCommandeFormGroup = this.bonCommandeFormService.createBonCommandeFormGroup();

  // ================================
  // Accordéon
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global']);

  // ================================
  // Liste déroulante Affaire (ng-select)
  // ================================
  affaireResults: IAffaire[] = [];
  selectedAffaire: IAffaire | null = null; // Sélection courante liée au ng-select
  selectedAffaireCode: string | null = null; // Code projet (identifiantUnique) — affichage seul

  autreResponsable: string | null = null; // Champ libre, non persisté pour le moment
  selectedAutreResponsable: IContactSociete | null = null; // Sélection courante liée au ng-select (même source que Responsable)

  // Infos client — affichage uniquement, seul clientId est persisté (formControlName)
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  loadingAffaires = false;
  affaireSearchTerm = '';
  affairePage = 0;
  affaireTotalItems = 0;

  protected readonly affaireSearch$ = new Subject<string>();

  // ================================
  // Liste déroulante Responsable (contacts ayant le rôle MANAGER)
  // ================================
  responsables: IContactSociete[] = [];
  selectedResponsable: IContactSociete | null = null; // Sélection courante liée au ng-select
  loadingResponsables = false;

  constructor(
    protected bonCommandeService: BonCommandeService,
    protected bonCommandeFormService: BonCommandeFormService,
    protected activatedRoute: ActivatedRoute,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadResponsables();
    this.loadAffaires(''); // Pré-charge la liste des projets dès l'ouverture du formulaire

    this.activatedRoute.data.subscribe(({ bonCommande }) => {
      this.bonCommande = bonCommande;

      if (bonCommande) {
        this.updateForm(bonCommande);
      }

      // Nouveau bon de commande : date du jour par défaut
      if (!bonCommande || bonCommande.id === null || bonCommande.id === undefined) {
        this.editForm.patchValue({
          dateBonCommande: dayjs().format(DATE_TIME_FORMAT),
        });
      }
    });

    // Recherche avec debounce de 300 ms
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
  // Liste déroulante Affaire (ng-select)
  // ================================

  /**
   * Appelé par ng-select à chaque frappe dans le champ de recherche
   * (relié via [typeahead]="affaireSearch$").
   */
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

  // ================================
  // Pagination (scroll infini ng-select)
  // ================================
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

  /**
   * Fonction de comparaison pour ng-select (objets IAffaire par id).
   */
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

    // Sélection affichée dans le ng-select
    this.selectedAffaire = affaire;

    // Code projet affiché à côté (lecture seule)
    this.selectedAffaireCode = affaire.identifiantUnique ?? null;

    this.loadClientInfo(clientId, true);
  }

  /**
   * Appelé directement par le (change) du ng-select Affaire.
   * `null` signifie que l'utilisateur a vidé la sélection.
   */
  onAffaireSelectChange(affaire: IAffaire | null): void {
    if (affaire) {
      this.selectAffaire(affaire);
    } else {
      this.editForm.patchValue({ affaireId: null, clientId: null });
      this.selectedAffaire = null;
      this.selectedAffaireCode = null;
      this.selectedClientInfo = null;
    }
  }

  /**
   * Récupère les infos complètes du client via un appel API dédié (GET /api/clients/{id}).
   * Affichage uniquement — seul clientId est persisté avec le BonCommande.
   *
   * @param syncReferenceClient Si true, pré-remplit referenceClient avec le matricule fiscale
   *                            du client (utilisé uniquement lors de la sélection d'un projet,
   *                            pas au chargement d'un bon de commande existant).
   */
  private loadClientInfo(clientId: number | null, syncReferenceClient = false): void {
    this.selectedClientInfo = null;

    if (clientId === null || clientId === undefined) {
      return;
    }

    this.loadingClientInfo = true;

    this.clientService.find(clientId).subscribe({
      next: res => {
        this.selectedClientInfo = res.body ?? null;
        this.loadingClientInfo = false;

        if (syncReferenceClient) {
          this.editForm.patchValue({
            referenceClient: this.selectedClientInfo?.identifiantUnique ?? null,
          });
        }
      },
      error: () => {
        this.selectedClientInfo = null;
        this.loadingClientInfo = false;
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
  // Autre Responsable (champ libre, non persisté — même source que Responsable)
  // ================================
  onAutreResponsableSelectChange(responsable: IContactSociete | null): void {
    this.selectedAutreResponsable = responsable;
    this.autreResponsable = responsable?.nomPrenom ?? null;
  }

  /**
   * Fonction de comparaison pour ng-select (objets IContactSociete par id).
   */
  compareResponsable = (a: IContactSociete | null, b: IContactSociete | null): boolean => (a && b ? a.id === b.id : a === b);

  private loadResponsableLabel(responsableId: number): void {
    this.bonCommandeService.findResponsableById(responsableId).subscribe({
      next: res => {
        this.selectedResponsable = res.body ?? null;
      },
    });
  }

  // ================================
  // Ouvrir modal de sélection
  // ================================
  openAffaireModal(): void {
    const modalRef = this.modalService.open(AffaireSelectorModalComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'affaire-selector-modal-window',
    });

    // Statut propre à cette interface — chaque appelant du modal fixe le sien.
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

    modalRef.result
      .then((contact: IContactSociete) => {
        if (contact) {
          this.onAutreResponsableSelectChange(contact);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  // ================================
  // Navigation
  // ================================
  previousState(): void {
    window.history.back();
  }

  // ================================
  // Sauvegarde
  // ================================
  save(): void {
    this.isSaving = true;

    const bonCommande = this.bonCommandeFormService.getBonCommande(this.editForm);

    if (bonCommande.id !== null) {
      this.subscribeToSaveResponse(this.bonCommandeService.update(bonCommande));
    } else {
      this.subscribeToSaveResponse(this.bonCommandeService.create(bonCommande));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBonCommande>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // API for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  // ================================
  // Chargement formulaire
  // ================================
  protected updateForm(bonCommande: IBonCommande): void {
    this.bonCommande = bonCommande;

    this.bonCommandeFormService.resetForm(this.editForm, bonCommande);

    const affaireId = bonCommande.affaireId;

    if (affaireId !== null && affaireId !== undefined) {
      this.affaireService.find(affaireId).subscribe({
        next: res => {
          const affaire = res.body;

          if (affaire) {
            this.selectedAffaire = affaire;
            this.selectedAffaireCode = affaire.identifiantUnique ?? null;

            // Nécessaire pour que le ng-select affiche bien l'option sélectionnée
            // même si elle n'est pas (encore) dans affaireResults.
            if (!this.affaireResults.some(a => a.id === affaire.id)) {
              this.affaireResults = [affaire, ...this.affaireResults];
            }
          }
        },
      });
    }

    // Infos client pour affichage — appel API dédié, indépendant de l'objet affaire
    const clientId = bonCommande.clientId as number | null | undefined;

    if (clientId !== null && clientId !== undefined) {
      this.loadClientInfo(clientId);
    }

    // Libellé du responsable pour affichage — le formulaire ne persiste que l'id
    const responsableId = bonCommande.responsableId;

    if (responsableId !== null && responsableId !== undefined && responsableId !== '') {
      this.loadResponsableLabel(Number(responsableId));
    }
  }
}
