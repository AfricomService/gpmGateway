import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { finalize, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AffaireFormService, AffaireFormGroup } from './affaire-form.service';
import { IAffaire } from '../affaire.model';
import { AffaireService, RestPage } from '../service/affaire.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { StatutAffaire } from 'app/entities/enumerations/statut-affaire.model';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { IArticle } from 'app/entities/projectService/article/article.model';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';
import { ArticleImportService, IArticleImportResult } from 'app/entities/projectService/article/service/article-import.service';
import { IMatriceFacturation, NewMatriceFacturation } from 'app/entities/projectService/matrice-facturation/matrice-facturation.model';
import { MatriceFacturationService } from 'app/entities/projectService/matrice-facturation/service/matrice-facturation.service';
import { AffaireArticleService } from 'app/entities/projectService/affaire-article/service/affaire-article.service';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { VilleService } from 'app/entities/projectService/ville/service/ville.service';
import { IZone } from 'app/entities/projectService/zone/zone.model';
import { ZoneService } from 'app/entities/projectService/zone/service/zone.service';
import { SocieteService } from '../../societe/service/societe.service';
import { ISociete } from '../../societe/societe.model';
import { IAgence } from 'app/entities/projectService/agence/agence.model';

type AccordionSection = 'general' | 'dates' | 'articles' | 'societes';

@Component({
  selector: 'jhi-affaire-update',
  templateUrl: './affaire-update.component.html',
  styleUrls: ['./affaire-update.component.scss'],
})
export class AffaireUpdateComponent implements OnInit {
  @ViewChild('articleModal') articleModal!: TemplateRef<any>;
  @ViewChild('articleImportModal') articleImportModal!: TemplateRef<any>;
  @ViewChild('matriceModal') matriceModal!: TemplateRef<any>;
  @ViewChild('societeModal') societeModal!: TemplateRef<any>;

  isSaving = false;
  affaire: IAffaire | null = null;
  statutAffaireValues = Object.keys(StatutAffaire);

  isEditMode = false;

  // Accordion management
  openSections: Set<AccordionSection> = new Set(['general', 'dates']);
  isChangingStatut = false;

  clientsSharedCollection: IClient[] = [];
  usersSharedCollection: IUser[] = [];
  selectedResponsable: IUser | null = null;

  // ── Server-Side Paginated Articles for Affaire ───────────────────
  selectedArticles: IArticle[] = [];
  articlesTotalItems = 0;
  articlesPage = 1; // 1-indexed for ngb-pagination
  articlesItemsPerPage = 5;
  articlesSearchTerm = '';
  isLoadingArticles = false;

  // Articles lookup list for the Modal selection
  allArticles: IArticle[] = [];
  tempSelectedArticles: IArticle[] = [];
  modalArticleSearchTerm = '';

  // ── Import Articles ──────────────────────────────────────────────
  articleImportFile: File | null = null;
  articleImportInProgress = false;
  articleImportResult: IArticleImportResult | null = null;
  articleImportDragOver = false;

  selectedMatrices: IMatriceFacturation[] = [];
  allVilles: IVille[] = [];
  allZones: IZone[] = [];
  newMatrice: Partial<NewMatriceFacturation> = {};

  clientIdFromQuery: number | null = null;

  // ── Sociétés Associées ─────────────────────────────────────────
  societesAssociees: ISociete[] = [];
  allSocietes: ISociete[] = [];
  tempSelectedSocietes: ISociete[] = [];
  societeSearchTerm = '';
  isSavingSocietes = false;
  primarySociete: ISociete | null = null;

  // ── Success message ─────────────────────────────────────────────
  successMessage: string | null = null;
  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  agencesClient: IAgence[] = [];
  editForm: AffaireFormGroup = this.affaireFormService.createAffaireFormGroup();
  societesSharedCollection: ISociete[] = [];

  private articleSearchSubject = new Subject<string>();

  constructor(
    protected affaireService: AffaireService,
    protected affaireFormService: AffaireFormService,
    protected clientService: ClientService,
    protected userService: UserService,
    protected articleService: ArticleService,
    protected articleImportService: ArticleImportService,
    protected affaireArticleService: AffaireArticleService,
    protected matriceFacturationService: MatriceFacturationService,
    protected villeService: VilleService,
    protected zoneService: ZoneService,
    protected activatedRoute: ActivatedRoute,
    protected modalService: NgbModal,
    protected societeService: SocieteService,
    protected router: Router,
    protected location: Location
  ) {}

  ngOnInit(): void {
    // Setup debounced search for the main articles list
    this.articleSearchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(searchTerm => {
      this.articlesSearchTerm = searchTerm;
      this.articlesPage = 1;
      this.loadArticlesByAffaire();
    });

    this.activatedRoute.queryParamMap.subscribe(params => {
      const rawClientId = params.get('clientId');
      const parsedClientId = rawClientId ? Number(rawClientId) : null;
      this.clientIdFromQuery = parsedClientId !== null && !Number.isNaN(parsedClientId) ? parsedClientId : null;
      this.applyClientFromQueryParam();
    });

    this.loadSocietes();

    this.activatedRoute.data.subscribe(({ affaire }) => {
      this.affaire = affaire ?? null;

      if (affaire) {
        // Existing affaire: updateForm handles isEditMode = !affaire.id (false)
        if (this.affaire?.societeId) {
          this.societeService.find(this.affaire.societeId).subscribe(res => (this.primarySociete = res.body));
        }
        this.updateForm(affaire);
      } else {
        // NEW affaire: force edit mode so the form is editable immediately
        this.isEditMode = true;
        // Apply the same default statut logic that updateForm normally handles
        if (!this.editForm.get('statut')?.value) {
          this.editForm.patchValue({ statut: StatutAffaire.Brouillon });
        }
      }

      this.loadRelationshipsOptions();
    });

    this.loadSocietesAssociees();

    const clientId = this.editForm.get('client')?.value?.id;
    if (clientId != null) {
      this.loadAgencesClient(clientId);
    }

    this.editForm.get('client')?.valueChanges.subscribe(client => {
      this.agencesClient = [];
      if (client?.id) {
        this.loadAgencesClient(client.id);
      }
    });
  }

  // ── Articles Server-Side Operations ──────────────────────────────
  loadArticlesByAffaire(): void {
    if (!this.affaire?.id) {
      return;
    }

    this.isLoadingArticles = true;

    const requestParams = {
      page: this.articlesPage - 1, // Spring Data uses 0-based index
      size: this.articlesItemsPerPage,
      searchTerm: this.articlesSearchTerm,
    };

    this.affaireService
      .getArticlesByAffaire(this.affaire.id, requestParams)
      .pipe(finalize(() => (this.isLoadingArticles = false)))
      .subscribe({
        next: (res: HttpResponse<RestPage<IArticle>>) => {
          if (res.body) {
            this.selectedArticles = res.body.content;
            this.articlesTotalItems = res.body.totalElements;
          }
        },
        error: err => console.error('Failed to load articles', err),
      });
  }

  onArticlesSearchChange(term: string): void {
    this.articleSearchSubject.next(term);
  }

  onArticlesPageChange(page: number): void {
    this.articlesPage = page;
    this.loadArticlesByAffaire();
  }

  removeArticle(article: IArticle): void {
    if (!article.id) {
      return;
    }

    if (this.affaire?.id) {
      // Server call to delete relation
      this.affaireService.removeRelation(this.affaire.id, article.id).subscribe({
        next: () => {
          this.loadArticlesByAffaire();
        },
        error: err => console.error('Error removing article relation', err),
      });
    } else {
      // Local removal for unsaved Affaire
      this.selectedArticles = this.selectedArticles.filter(a => a.id !== article.id);
    }
  }

  // ── Article Selection Modal ──────────────────────────────────────
  openArticleModal(): void {
    this.tempSelectedArticles = [...this.selectedArticles];
    this.modalService.open(this.articleModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  toggleTempArticleSelection(article: IArticle): void {
    const index = this.tempSelectedArticles.findIndex(a => a.id === article.id);
    if (index > -1) {
      this.tempSelectedArticles.splice(index, 1);
    } else {
      this.tempSelectedArticles.push(article);
    }
  }

  isTempArticleSelected(article: IArticle): boolean {
    return this.tempSelectedArticles.some(a => a.id === article.id);
  }

  confirmArticleSelection(modal: any): void {
    const selectedIds = this.tempSelectedArticles.map(a => a.id).filter((id): id is number => id != null);

    if (this.affaire?.id) {
      // Server-side replace relation
      this.affaireService.replaceArticlesForAffaire(this.affaire.id, selectedIds).subscribe({
        next: () => {
          this.loadArticlesByAffaire();
          modal.close();
        },
        error: err => console.error('Error replacing articles', err),
      });
    } else {
      // Unsaved entity local state
      this.selectedArticles = [...this.tempSelectedArticles];
      modal.close();
    }
  }

  get filteredModalArticles(): IArticle[] {
    if (!this.modalArticleSearchTerm) {
      return this.allArticles;
    }
    const term = this.modalArticleSearchTerm.toLowerCase();
    return this.allArticles.filter(
      a => (a.code?.toLowerCase() ?? '').includes(term) || (a.designation?.toLowerCase() ?? '').includes(term)
    );
  }

  // ── Import d'articles depuis Excel ──────────────────────────────
  openArticleImportModal(): void {
    this.articleImportFile = null;
    this.articleImportResult = null;
    this.modalService.open(this.articleImportModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  onArticleImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.articleImportFile = input.files && input.files.length > 0 ? input.files[0] : null;
    this.articleImportResult = null;
  }

  submitArticleImport(): void {
    if (!this.affaire?.id || !this.articleImportFile) {
      return;
    }

    this.articleImportInProgress = true;
    this.articleImportService.importArticles(this.affaire.id, this.articleImportFile).subscribe({
      next: response => {
        this.articleImportResult = response.body;
        this.articleImportInProgress = false;
        this.loadArticlesByAffaire();
      },
      error: () => {
        this.articleImportInProgress = false;
      },
    });
  }

  downloadArticleTemplate(): void {
    this.articleImportService.downloadTemplate().subscribe(response => {
      const blob = response.body;
      if (!blob) {
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modele_import_articles.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onArticleImportDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.articleImportDragOver = true;
  }

  onArticleImportDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.articleImportDragOver = false;
  }

  onArticleImportDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.articleImportDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.articleImportFile = files[0];
      this.articleImportResult = null;
    }
  }

  removeArticleImportFile(): void {
    this.articleImportFile = null;
    this.articleImportResult = null;
  }

  // ── Accordion, Mode & Form standard logic ──────────────────────
  toggleSection(section: AccordionSection): void {
    if (this.openSections.has(section)) {
      this.openSections.delete(section);
    } else {
      this.openSections.add(section);
    }
  }

  isSectionOpen(section: AccordionSection): boolean {
    return this.openSections.has(section);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  get isExisting(): boolean {
    return this.editForm.controls.id.value !== null;
  }

  get nextStatut(): StatutAffaire | null {
    const current = this.editForm.get('statut')?.value as StatutAffaire;
    const flow: Record<string, StatutAffaire | null> = {
      [StatutAffaire.Brouillon]: StatutAffaire.EtudeOpportunite,
      [StatutAffaire.EtudeOpportunite]: StatutAffaire.ExecutionDesTravaux,
      [StatutAffaire.ExecutionDesTravaux]: StatutAffaire.ClotureProjet,
      [StatutAffaire.ClotureProjet]: StatutAffaire.Fin,
    };
    return flow[current as string] ?? null;
  }

  changeStatut(): void {
    const next = this.nextStatut;
    const affaireId = this.editForm.get('id')?.value;
    if (!next || !affaireId) {
      return;
    }

    this.isChangingStatut = true;
    this.affaireService.changeStatut(affaireId, next).subscribe({
      next: () => {
        this.editForm.patchValue({ statut: next });
        this.isChangingStatut = false;
      },
      error: err => {
        console.error(err);
        this.isChangingStatut = false;
      },
    });
  }

  // ── Matrice Modal ──────────────────────────────────────────────
  openMatriceModal(): void {
    this.newMatrice = {};
    this.modalService.open(this.matriceModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  deleteMatrice(matrice: IMatriceFacturation): void {
    if (matrice.id) {
      this.matriceFacturationService.delete(matrice.id).subscribe(() => {
        this.selectedMatrices = this.selectedMatrices.filter(m => m.id !== matrice.id);
      });
    }
  }

  saveNewMatrice(modal: any): void {
    const toCreate: NewMatriceFacturation = {
      id: null,
      tarifBase: this.newMatrice.tarifBase ?? null,
      tarifMissionNuit: this.newMatrice.tarifMissionNuit ?? null,
      tarifHebergement: this.newMatrice.tarifHebergement ?? null,
      tarifJourFerie: this.newMatrice.tarifJourFerie ?? null,
      tarifDimanche: this.newMatrice.tarifDimanche ?? null,
      affaire: this.affaire,
      ville: this.newMatrice.ville ?? null,
      zone: this.newMatrice.zone ?? null,
    };

    this.matriceFacturationService.create(toCreate).subscribe((res: HttpResponse<IMatriceFacturation>) => {
      if (res.body) {
        this.selectedMatrices = [...this.selectedMatrices, res.body];
      }
      modal.close();
    });
  }

  // ── Societe Modal ──────────────────────────────────────────────
  openSocieteModal(): void {
    this.tempSelectedSocietes = [...this.societesAssociees];
    if (this.allSocietes.length === 0) {
      this.loadAllSocietes();
    }
    this.modalService.open(this.societeModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  loadAllSocietes(): void {
    this.societeService
      .query({ page: 0, size: 1000, sort: ['id', 'asc'] })
      .pipe(map((res: HttpResponse<ISociete[]>) => res.body ?? []))
      .subscribe((societes: ISociete[]) => (this.allSocietes = societes));
  }

  toggleTempSocieteSelection(societe: ISociete): void {
    const index = this.tempSelectedSocietes.findIndex(s => s.id === societe.id);
    if (index > -1) {
      this.tempSelectedSocietes.splice(index, 1);
    } else {
      this.tempSelectedSocietes.push(societe);
    }
  }

  isTempSocieteSelected(societe: ISociete): boolean {
    return this.tempSelectedSocietes.some(s => s.id === societe.id);
  }

  get filteredSocietes(): ISociete[] {
    if (!this.societeSearchTerm) {
      return this.allSocietes;
    }
    const term = this.societeSearchTerm.toLowerCase();
    return this.allSocietes.filter(s => (s.raisonSociale?.toLowerCase() ?? '').includes(term));
  }

  confirmSocieteSelection(modal: any): void {
    if (!this.affaire?.id) {
      modal.close();
      return;
    }

    this.isSavingSocietes = true;
    const societeIds = this.tempSelectedSocietes.map(s => s.id);

    this.affaireService
      .updateSocieteAssociees({ affaireId: this.affaire.id, societeIds })
      .pipe(finalize(() => (this.isSavingSocietes = false)))
      .subscribe({
        next: () => {
          this.societesAssociees = [...this.tempSelectedSocietes];
          modal.close();
        },
        error: err => {
          console.error(err);
        },
      });
  }

  // ── Shared Helpers ─────────────────────────────────────────────
  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  previousState(): void {
    window.history.back();
  }

  loadSocietes(): void {
    this.societeService.query({ page: 0, size: 1000, sort: ['id', 'asc'] }).subscribe(res => {
      this.societesSharedCollection = res.body ?? [];
    });
  }

  loadAgencesClient(clientId: number): void {
    this.affaireService
      .getAgencesByClientId({ clientId })
      .pipe(map((res: HttpResponse<IAgence[]>) => res.body ?? []))
      .subscribe((agences: IAgence[]) => (this.agencesClient = agences));
  }

  loadSocietesAssociees(): void {
    if (this.affaire?.id) {
      this.societeService.findAllSocieteByAffaireId({ affaireId: this.affaire.id }).subscribe((res: HttpResponse<any[]>) => {
        this.societesAssociees = res.body ?? [];
      });
    }
  }

  save(): void {
    this.isSaving = true;

    if (this.selectedResponsable) {
      this.editForm.patchValue({
        responsableProjetId: this.selectedResponsable.id,
        responsableProjetUserLogin: this.selectedResponsable.login,
      });
    }

    const affaire = this.affaireFormService.getAffaire(this.editForm);
    const isCreation = affaire.id === null;
    if (!isCreation) {
      this.subscribeToSaveResponse(this.affaireService.update(affaire), isCreation);
    } else {
      this.subscribeToSaveResponse(this.affaireService.create(affaire), isCreation);
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAffaire>>, isCreation: boolean): void {
    result.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: res => {
        const affaire = res.body;
        if (!affaire) {
          return;
        }

        if (isCreation && affaire.id !== null && this.selectedArticles.length > 0) {
          const ids = this.selectedArticles.map(a => a.id).filter((id): id is number => id != null);
          this.affaireService.replaceArticlesForAffaire(affaire.id, ids).subscribe({
            next: () => this.onSaveSuccess(affaire, isCreation),
            error: err => {
              console.error(err);
              this.onSaveSuccess(affaire, isCreation);
            },
          });
        } else {
          this.onSaveSuccess(affaire, isCreation);
        }
      },
      error: err => {
        console.error(err);
      },
    });
  }

  protected onSaveSuccess(affaire: IAffaire, isCreation: boolean): void {
    this.affaire = affaire;
    this.updateForm(affaire);

    if (isCreation && affaire.id !== null) {
      const editUrl = this.router.createUrlTree(['/affaire', affaire.id, 'edit']).toString();
      this.location.replaceState(editUrl);
    }

    this.loadSocietesAssociees();

    this.successMessage = isCreation ? 'Affaire créée avec succès.' : 'Affaire mise à jour avec succès.';

    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
    this.successMessageTimeout = setTimeout(() => {
      this.successMessage = null;
    }, 4000);
  }

  dismissSuccessMessage(): void {
    this.successMessage = null;
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
  }

  protected updateForm(affaire: IAffaire): void {
    this.affaire = affaire;
    this.isEditMode = !affaire.id;
    this.affaireFormService.resetForm(this.editForm, affaire);

    if (!affaire.id && !this.editForm.get('statut')?.value) {
      this.editForm.patchValue({ statut: StatutAffaire.Brouillon });
    }

    if (affaire.responsableProjetId && affaire.responsableProjetUserLogin) {
      this.selectedResponsable = {
        id: affaire.responsableProjetId,
        login: affaire.responsableProjetUserLogin,
      };
    }

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, affaire.client);

    if (affaire.id) {
      this.loadArticlesByAffaire();

      this.matriceFacturationService.findMatriceByAffaireId(affaire.id).subscribe((res: HttpResponse<IMatriceFacturation[]>) => {
        this.selectedMatrices = res.body ?? [];
      });
    }
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.affaire?.client)))
      .subscribe((clients: IClient[]) => {
        this.clientsSharedCollection = clients;
        this.applyClientFromQueryParam();
      });

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .subscribe((users: IUser[]) => {
        this.usersSharedCollection = users;
        if (this.selectedResponsable && !this.usersSharedCollection.find(u => u.id === this.selectedResponsable?.id)) {
          this.usersSharedCollection = [this.selectedResponsable, ...this.usersSharedCollection];
        }
      });

    this.articleService
      .query()
      .pipe(map((res: HttpResponse<IArticle[]>) => res.body ?? []))
      .subscribe((articles: IArticle[]) => (this.allArticles = articles));

    this.villeService
      .query()
      .pipe(map((res: HttpResponse<IVille[]>) => res.body ?? []))
      .subscribe((villes: IVille[]) => (this.allVilles = villes));

    this.zoneService
      .query()
      .pipe(map((res: HttpResponse<IZone[]>) => res.body ?? []))
      .subscribe((zones: IZone[]) => (this.allZones = zones));
  }

  protected applyClientFromQueryParam(): void {
    if (this.clientIdFromQuery === null || this.editForm.controls.id.value !== null) {
      return;
    }
    const queryClient = this.clientsSharedCollection.find(client => client.id === this.clientIdFromQuery);
    if (queryClient) {
      this.editForm.patchValue({ client: queryClient });
    }
  }
}
