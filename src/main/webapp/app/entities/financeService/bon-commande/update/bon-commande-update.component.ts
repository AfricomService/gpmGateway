import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { BonCommandeFormService, BonCommandeFormGroup } from './bon-commande-form.service';
import { IBonCommande } from '../bon-commande.model';
import { BonCommandeService } from '../service/bon-commande.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';

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

  // === Gestion de l'accordéon ===
  openPanels: Set<AccordionPanel> = new Set(['global', 'client']);

  // === Gestion de la liste déroulante "Affaire" ===
  affaireDropdownOpen = false;
  affaireResults: IAffaire[] = [];
  selectedAffaireLabel = '';
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
    protected elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ bonCommande }) => {
      this.bonCommande = bonCommande;
      if (bonCommande) {
        this.updateForm(bonCommande);
      }
    });

    // Rafraîchit la liste à chaque frappe (debounce 300ms), reset pagination à chaque nouvelle recherche
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
      .subscribe(res => this.onAffairePageLoaded(res, true));
  }

  ngOnDestroy(): void {
    this.affaireSearch$.complete();
  }

  // Ferme le dropdown si on clique en dehors du composant
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.affaireDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.affaireDropdownOpen = false;
    }
  }

  // === Accordéon ===
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

  // === Liste déroulante "Affaire" ===
  openAffaireDropdown(): void {
    this.affaireDropdownOpen = true;
    if (this.affaireResults.length === 0 && !this.loadingAffaires) {
      this.loadAffaires('');
    }
  }

  onAffaireSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
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
      .subscribe(res => this.onAffairePageLoaded(res, true));
  }

  // Pagination : charge la page suivante quand on scrolle en bas de la liste
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
        .subscribe(res => this.onAffairePageLoaded(res, false));
    }
  }

  private onAffairePageLoaded(res: HttpResponse<IAffaire[]>, reset: boolean): void {
    const items = res.body ?? [];
    this.affaireTotalItems = Number(res.headers.get('X-Total-Count') ?? items.length);
    this.affaireResults = reset ? items : [...this.affaireResults, ...items];
    this.loadingAffaires = false;
  }

  selectAffaire(affaire: IAffaire): void {
    this.editForm.patchValue({ affaireId: affaire.id });
    this.selectedAffaireLabel = `${affaire.designationAffaire} (N° ${affaire.numAffaire})`;
    this.affaireDropdownOpen = false;
  }

  previousState(): void {
    window.history.back();
  }

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
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(bonCommande: IBonCommande): void {
    this.bonCommande = bonCommande;
    this.bonCommandeFormService.resetForm(this.editForm, bonCommande);

    const affaireId = bonCommande.affaireId;
    if (affaireId !== null && affaireId !== undefined) {
      this.affaireService.find(affaireId).subscribe(res => {
        const affaire = res.body;
        if (affaire) {
          this.selectedAffaireLabel = `${affaire.designationAffaire} (N° ${affaire.numAffaire})`;
        }
      });
    }
  }
}
