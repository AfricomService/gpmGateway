import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';

type AccordionPanel = 'global' | 'client';

const AFFAIRE_STATUT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 15;

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
  // Liste déroulante Affaire
  // ================================
  affaireDropdownOpen = false;
  affaireResults: IAffaire[] = [];
  selectedAffaireLabel = '';
  affaireInputValue = '';
  selectedAffaireCode: string | null = null; // Code projet (identifiantUnique) — affichage seul

  autreResponsable: string | null = null; // Champ libre, non persisté pour le moment

  // Infos client — affichage uniquement, seul clientId est persisté (formControlName)
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  loadingAffaires = false;
  affaireSearchTerm = '';
  affairePage = 0;
  affaireTotalItems = 0;

  private readonly affaireSearch$ = new Subject<string>();

  constructor(
    protected bonCommandeService: BonCommandeService,
    protected bonCommandeFormService: BonCommandeFormService,
    protected activatedRoute: ActivatedRoute,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected elementRef: ElementRef,
    protected modalService: NgbModal
  ) {}

  ngOnInit(): void {
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
  // Fermer dropdown au clic extérieur
  // ================================
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.affaireDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.affaireDropdownOpen = false;
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
  // Liste déroulante Affaire
  // ================================
  openAffaireDropdown(): void {
    this.affaireDropdownOpen = true;

    if (this.affaireResults.length === 0 && !this.loadingAffaires) {
      this.loadAffaires('');
    }
  }

  toggleAffaireDropdown(event: MouseEvent): void {
    // Empêche le clic de remonter jusqu'au (focus) de l'input,
    // qui rouvrirait immédiatement la liste qu'on vient de fermer.
    event.stopPropagation();
    event.preventDefault();

    if (this.affaireDropdownOpen) {
      this.affaireDropdownOpen = false;
    } else {
      this.openAffaireDropdown();
    }
  }

  onAffaireSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.affaireInputValue = value;
    this.affaireDropdownOpen = true;

    this.affaireSearch$.next(value);
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
  // Pagination dropdown
  // ================================
  onAffaireListScroll(event: Event): void {
    const el = event.target as HTMLElement;

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

    const hasMore = this.affaireResults.length < this.affaireTotalItems;

    if (atBottom && hasMore && !this.loadingAffaires) {
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

    this.selectedAffaireLabel = `${affaire.designationAffaire} (N° ${affaire.numAffaire})`;

    // Valeur affichée dans l'input
    this.affaireInputValue = this.selectedAffaireLabel;

    // Code projet affiché à côté (lecture seule)
    this.selectedAffaireCode = affaire.identifiantUnique ?? null;

    this.affaireDropdownOpen = false;

    this.loadClientInfo(clientId, true);
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
  // Ouvrir modal de sélection
  // ================================
  openAffaireModal(): void {
    this.affaireDropdownOpen = false;

    const modalRef = this.modalService.open(AffaireSelectorModalComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'affaire-selector-modal-window',
    });

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
            this.selectedAffaireLabel = `${affaire.designationAffaire} (N° ${affaire.numAffaire})`;

            this.affaireInputValue = this.selectedAffaireLabel;

            this.selectedAffaireCode = affaire.identifiantUnique ?? null;
          }
        },
      });
    }

    // Infos client pour affichage — appel API dédié, indépendant de l'objet affaire
    const clientId = bonCommande.clientId as number | null | undefined;

    if (clientId !== null && clientId !== undefined) {
      this.loadClientInfo(clientId);
    }
  }
}
