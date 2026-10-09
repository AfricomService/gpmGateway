import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { finalize, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

import { AffaireFormService, AffaireFormGroup } from './affaire-form.service';
import { IAffaire } from '../affaire.model';
import { AffaireService, RestPage } from '../service/affaire.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { StatutAffaire } from 'app/entities/enumerations/statut-affaire.model';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { ContactSelectorModalComponent } from 'app/entities/financeService/bon-commande/contact-selector-modal/contact-selector-modal.component';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';

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
import { Authority } from '../../../../config/authority.constants';
import { AccountService } from '../../../../core/auth/account.service';

type AccordionSection = 'general' | 'dates' | 'articles' | 'societes';

interface IStatutTransition {
  statut: StatutAffaire;
  label: string;
  requiredAuthority?: string;
}

const RESPONSABLE_ROLE_CODE = 'MANAGER';

// Route de la liste des affaires (redirection après changement de statut)
const AFFAIRES_LIST_URL = '/affaire';

// Nom du fichier de résultats d'import
const IMPORT_RESULTS_FILENAME = 'import_results.xlsx';
const IMPORT_RESULT_COLUMN_HEADER = 'Résultat import';

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
  @ViewChild('statutConfirmModal') statutConfirmModal!: TemplateRef<any>;

  isSaving = false;
  affaire: IAffaire | null = null;
  statutAffaireValues = Object.keys(StatutAffaire);

  isEditMode = false;

  // Accordion management
  openSections: Set<AccordionSection> = new Set(['general', 'dates']);
  isChangingStatut = false;

  // ── Confirmation changement de statut ───────────────────────────
  pendingTransition: IStatutTransition | null = null;

  clientsSharedCollection: IClient[] = [];
  responsables: IContactSociete[] = [];
  selectedResponsable: IContactSociete | null = null;
  loadingResponsables = false;

  // ── Server-Side Paginated Articles for Affaire ───────────────────
  selectedArticles: IArticle[] = [];
  articlesTotalItems = 0;
  articlesPage = 1; // 1-indexed for ngb-pagination
  articlesItemsPerPage = 5;
  articlesSearchTerm = '';
  isLoadingArticles = false;

  Authority = Authority;

  // Articles lookup list for the Modal selection
  allArticles: IArticle[] = [];
  tempSelectedArticles: IArticle[] = [];
  modalArticleSearchTerm = '';

  // ── Import Articles ──────────────────────────────────────────────
  articleImportFile: File | null = null;
  articleImportInProgress = false;
  articleImportResult: IArticleImportResult | null = null;
  articleImportDragOver = false;
  articleImportResultBlob: Blob | null = null;
  importResultsFileError: string | null = null;

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

  agencesClient: IAgence[] = [];
  editForm: AffaireFormGroup = this.affaireFormService.createAffaireFormGroup();
  societesSharedCollection: ISociete[] = [];

  // ── Success message ─────────────────────────────────────────────
  successMessage: string | null = null;
  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  private articleSearchSubject = new Subject<string>();

  constructor(
    protected affaireService: AffaireService,
    protected affaireFormService: AffaireFormService,
    protected clientService: ClientService,
    protected bonCommandeService: BonCommandeService,
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
    protected location: Location,
    protected accountService: AccountService
  ) {}

  get canRead(): boolean {
    return !this.isExisting || (this.affaire?.canRead ?? false);
  }

  // New affaire: the creator gets WRITE on save. Existing: use the flag from the backend.
  get canWrite(): boolean {
    return !this.isExisting || (this.affaire?.canWrite ?? false);
  }

  // Backend lets ADMIN / ACTIVATE_AFFAIRE change the statut even without WRITE
  // (needed e.g. to reactivate an affaire in "Fin", where everyone is read-only).
  get canChangeStatut(): boolean {
    return this.canWrite || this.accountService.hasAnyAuthority([Authority.ADMIN, Authority.ACTIVATE_AFFAIRE]);
  }

  onResponsableSelectChange(responsable: IContactSociete | null): void {
    this.selectedResponsable = responsable;
    this.editForm.patchValue({
      responsableProjetId: responsable?.id !== undefined && responsable?.id !== null ? String(responsable.id) : null,
      responsableProjetUserLogin: responsable?.matricule ?? null,
    });
    this.editForm.get('responsableProjetId')?.markAsDirty();
    this.editForm.get('responsableProjetId')?.markAsTouched();
  }

  compareResponsable = (a: IContactSociete | null, b: IContactSociete | null): boolean => (a && b ? a.id === b.id : a === b);

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

  private loadResponsables(societeId?: number | null | undefined): void {
    this.loadingResponsables = true;

    this.bonCommandeService.findResponsablesByRole(RESPONSABLE_ROLE_CODE, societeId).subscribe({
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

  private loadResponsableLabel(responsableId: number): void {
    this.bonCommandeService.findResponsableById(responsableId).subscribe({
      next: res => {
        this.selectedResponsable = res.body ?? null;
      },
    });
  }

  // ── Client Demandeur → pré-remplit Client Finale par défaut (reste éditable) ──
  onClientCommandeChange(client: IClient | null): void {
    if (client) {
      this.editForm.patchValue({ client });
      this.editForm.get('client')?.markAsDirty();
      this.editForm.get('client')?.markAsTouched();
    }
  }

  ngOnInit(): void {
    // Charge la liste initiale des responsables (filtrée si une société est déjà présélectionnée dans le form)
    this.loadResponsables(this.editForm.get('societeId')?.value);

    // Recharge la liste des responsables à chaque changement de société principale
    this.editForm.get('societeId')?.valueChanges.subscribe((societeId: number | null | undefined) => {
      this.loadResponsables(societeId ?? null);
    });

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
    if (!article.id || !this.canWrite) {
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
    this.articleImportResultBlob = null;
    this.importResultsFileError = null;
    this.modalService.open(this.articleImportModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  onArticleImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.articleImportFile = input.files && input.files.length > 0 ? input.files[0] : null;
    this.resetImportResults();
  }

  submitArticleImport(): void {
    if (!this.affaire?.id || !this.articleImportFile || !this.canWrite) {
      return;
    }

    const uploadedFile = this.articleImportFile;

    this.articleImportInProgress = true;
    this.resetImportResults();

    this.articleImportService.importArticles(this.affaire.id, uploadedFile).subscribe({
      next: response => {
        this.articleImportResult = response.body;
        this.articleImportInProgress = false;
        this.loadArticlesByAffaire();

        if (response.body) {
          // Génération du fichier "import results" à partir du fichier d'origine
          this.generateImportResultsFile(uploadedFile, response.body);
        }
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
      this.resetImportResults();
    }
  }

  removeArticleImportFile(): void {
    this.articleImportFile = null;
    this.resetImportResults();
  }

  private resetImportResults(): void {
    this.articleImportResult = null;
    this.articleImportResultBlob = null;
    this.importResultsFileError = null;
  }

  /**
   * Télécharge le fichier "import results" généré après l'import.
   */
  downloadImportResults(): void {
    if (!this.articleImportResultBlob) {
      return;
    }
    const url = window.URL.createObjectURL(this.articleImportResultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = IMPORT_RESULTS_FILENAME;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Reprend le fichier Excel importé et ajoute, à la fin de chaque ligne,
   * une colonne "Résultat import" :
   *   - "Importé avec succès"
   *   - "Non importé : <raison>"
   */
  private async generateImportResultsFile(file: File, result: IArticleImportResult): Promise<void> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet || !sheet['!ref']) {
        this.importResultsFileError = 'Impossible de générer le fichier de résultats : feuille Excel vide.';
        return;
      }

      const range = XLSX.utils.decode_range(sheet['!ref']);
      const resultCol = range.e.c + 1;

      const { rowStatuses, generalErrors } = this.buildRowStatuses(result);

      // Compte des lignes de données non vides (hors en-tête)
      const dataRows: number[] = [];
      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        if (this.isRowNotEmpty(sheet, r, range.s.c, range.e.c)) {
          dataRows.push(r);
        }
      }

      // Cas où rien n'a été importé et aucune erreur n'est rattachée à une ligne :
      // on considère que tout le fichier a été rejeté.
      const nothingImportedGlobally = result.successCount === 0 && rowStatuses.size === 0 && !result.rowResults?.length;

      // En-tête de la nouvelle colonne
      sheet[XLSX.utils.encode_cell({ r: range.s.r, c: resultCol })] = { t: 's', v: IMPORT_RESULT_COLUMN_HEADER };

      for (const r of dataRows) {
        const excelRowNumber = r + 1; // numéro de ligne tel qu'affiché dans Excel
        let message: string;

        if (nothingImportedGlobally) {
          const reason = generalErrors.length > 0 ? generalErrors.join(' | ') : 'raison non précisée';
          message = `Non importé : ${reason}`;
        } else {
          const rowError = rowStatuses.get(excelRowNumber);
          message = rowError === undefined ? 'Importé avec succès' : `Non importé : ${rowError}`;
        }

        sheet[XLSX.utils.encode_cell({ r, c: resultCol })] = { t: 's', v: message };
      }

      // Étendre la plage de la feuille et élargir la colonne
      range.e.c = resultCol;
      sheet['!ref'] = XLSX.utils.encode_range(range);
      const cols = sheet['!cols'] ?? [];
      cols[resultCol] = { wch: 60 };
      sheet['!cols'] = cols;

      // Feuille complémentaire pour les erreurs non rattachables à une ligne
      if (!nothingImportedGlobally && generalErrors.length > 0) {
        const errorsSheet = XLSX.utils.aoa_to_sheet([['Erreurs générales'], ...generalErrors.map(e => [e])]);
        errorsSheet['!cols'] = [{ wch: 100 }];
        XLSX.utils.book_append_sheet(workbook, errorsSheet, 'Erreurs générales');
      }

      const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.articleImportResultBlob = new Blob([output], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      this.importResultsFileError = null;
    } catch (e) {
      console.error('Failed to generate import results file', e);
      this.articleImportResultBlob = null;
      this.importResultsFileError = 'Impossible de générer le fichier de résultats.';
    }
  }

  private isRowNotEmpty(sheet: XLSX.WorkSheet, row: number, startCol: number, endCol: number): boolean {
    for (let c = startCol; c <= endCol; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c })];
      if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
        return true;
      }
    }
    return false;
  }

  /**
   * Associe chaque ligne Excel en échec à son message.
   * 1) Utilise result.rowResults si le backend le fournit.
   * 2) Sinon, extrait le numéro de ligne depuis les messages d'erreur
   *    (ex : "Ligne 5 : code article introuvable").
   * Les erreurs sans numéro de ligne sont retournées dans generalErrors.
   */
  private buildRowStatuses(result: IArticleImportResult): { rowStatuses: Map<number, string>; generalErrors: string[] } {
    const rowStatuses = new Map<number, string>();
    const generalErrors: string[] = [];

    if (result.rowResults && result.rowResults.length > 0) {
      for (const rr of result.rowResults) {
        if (!rr.success) {
          rowStatuses.set(rr.row, rr.message ?? 'raison non précisée');
        }
      }
      (result.errors ?? []).forEach(e => {
        if (!this.extractRowNumber(e)) {
          generalErrors.push(e);
        }
      });
      return { rowStatuses, generalErrors };
    }

    for (const err of result.errors ?? []) {
      const rowNumber = this.extractRowNumber(err);
      if (rowNumber !== null) {
        const cleaned = err.replace(/^\s*(?:ligne|line|row)\s*:?\s*\d+\s*[:\-–—]?\s*/i, '').trim();
        const previous = rowStatuses.get(rowNumber);
        const text = cleaned || err;
        rowStatuses.set(rowNumber, previous ? `${previous} | ${text}` : text);
      } else {
        generalErrors.push(err);
      }
    }

    return { rowStatuses, generalErrors };
  }

  private extractRowNumber(message: string): number | null {
    const match = /(?:ligne|line|row)\s*:?\s*(\d+)/i.exec(message);
    return match ? Number(match[1]) : null;
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
    if (!this.canWrite) {
      return;
    }
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

  get availableTransitions(): IStatutTransition[] {
    const current = this.editForm.get('statut')?.value as StatutAffaire;

    const flow: Record<StatutAffaire, IStatutTransition[]> = {
      [StatutAffaire.Brouillon]: [
        {
          statut: StatutAffaire.EtudeOpportunite,
          label: "Passer à l'étude d'opportunité",
        },
        {
          statut: StatutAffaire.ExecutionDesTravaux,
          label: "Passer à l'exécution des travaux",
        },
      ],

      [StatutAffaire.EtudeOpportunite]: [
        {
          statut: StatutAffaire.ExecutionDesTravaux,
          label: "Passer à l'exécution des travaux",
        },
      ],

      [StatutAffaire.ExecutionDesTravaux]: [
        {
          statut: StatutAffaire.ClotureProjet,
          label: 'Clôturer le projet',
        },
        {
          statut: StatutAffaire.EtudeOpportunite,
          label: "Revenir à l'étude d'opportunité",
        },
      ],

      [StatutAffaire.ClotureProjet]: [
        {
          statut: StatutAffaire.Fin,
          label: 'Terminer le projet',
        },
      ],

      [StatutAffaire.Fin]: [
        {
          statut: StatutAffaire.ExecutionDesTravaux,
          label: "Revenir à l'exécution des travaux",
          requiredAuthority: Authority.ACTIVATE_AFFAIRE,
        },
      ],
    };

    return (flow[current] ?? []).filter(t => !t.requiredAuthority || this.accountService.hasAnyAuthority(t.requiredAuthority));
  }

  // ── Changement de statut avec confirmation ──────────────────────
  /**
   * Ouvre la modale de confirmation. L'appel API n'est déclenché
   * qu'après clic sur "Confirmer".
   */
  askStatutChange(transition: IStatutTransition): void {
    if (this.isChangingStatut) {
      return;
    }

    this.pendingTransition = transition;

    const modalRef = this.modalService.open(this.statutConfirmModal, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });

    modalRef.result
      .then(confirmed => {
        if (confirmed && this.pendingTransition) {
          this.confirmStatutChange(modalRef, this.pendingTransition.statut);
        }
      })
      .catch(() => {
        // Modale fermée / annulée : on ne fait rien
      })
      .finally(() => {
        if (!this.isChangingStatut) {
          this.pendingTransition = null;
        }
      });
  }

  /**
   * Enregistre d'abord les modifications en cours (si formulaire modifié et valide),
   * change ensuite le statut puis redirige vers la liste des affaires.
   */
  private confirmStatutChange(_modalRef: unknown, next: StatutAffaire): void {
    const affaireId = this.editForm.get('id')?.value;

    if (!affaireId || !next) {
      return;
    }

    this.isChangingStatut = true;

    const shouldSaveFirst = this.isEditMode && this.canWrite && this.editForm.dirty && this.editForm.valid;

    if (shouldSaveFirst) {
      if (this.selectedResponsable) {
        this.editForm.patchValue({
          responsableProjetId:
            this.selectedResponsable.id !== undefined && this.selectedResponsable.id !== null ? String(this.selectedResponsable.id) : null,
          responsableProjetUserLogin: this.selectedResponsable.matricule ?? null,
        });
      }

      const affaire = this.affaireFormService.getAffaire(this.editForm);

      // Narrow IAffaire | NewAffaire -> IAffaire (an existing affaire always has an id)
      if (affaire.id === null) {
        this.isChangingStatut = false;
        this.pendingTransition = null;
        return;
      }

      this.affaireService.update(affaire).subscribe({
        next: () => this.applyStatutChangeAndClose(affaireId, next),
        error: err => {
          console.error(err);
          this.isChangingStatut = false;
          this.pendingTransition = null;
        },
      });
    } else {
      this.applyStatutChangeAndClose(affaireId, next);
    }
  }

  private applyStatutChangeAndClose(affaireId: number, next: StatutAffaire): void {
    this.affaireService.changeStatut(affaireId, next).subscribe({
      next: () => {
        this.editForm.patchValue({ statut: next });
        this.isChangingStatut = false;
        this.pendingTransition = null;
        // Save & close : retour à la liste des affaires
        this.router.navigate([AFFAIRES_LIST_URL]);
      },
      error: err => {
        console.error(err);
        this.isChangingStatut = false;
        this.pendingTransition = null;
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
        responsableProjetId:
          this.selectedResponsable.id !== undefined && this.selectedResponsable.id !== null ? String(this.selectedResponsable.id) : null,
        responsableProjetUserLogin: this.selectedResponsable.matricule ?? null,
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

    if (affaire.responsableProjetId) {
      const responsableId = Number(affaire.responsableProjetId);
      if (!Number.isNaN(responsableId)) {
        this.loadResponsableLabel(responsableId);
      }
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
