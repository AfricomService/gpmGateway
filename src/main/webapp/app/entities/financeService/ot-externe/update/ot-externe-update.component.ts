import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
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
import { IPieceJointe } from 'app/entities/projectService/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/projectService/piece-jointe/service/piece-jointe.service';
import { PjCareService, PjCareDriverInfo, ScanDriver, ScannedPage } from 'app/entities/projectService/piece-jointe/service/pjcare.service';
import { ScanSettingsService } from 'app/entities/projectService/piece-jointe/service/scan-settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs/esm';
import { ModelPhaseOTService } from '../../model-phase-ot/service/model-phase-ot.service';
import { IModelPhaseOT } from '../../model-phase-ot/model-phase-ot.model';
import { IPhaseOt } from '../../phase-ot/phase-ot.model';
import { IArticle } from '../../../projectService/article/article.model';
import { IOtArticles, NewOtArticles } from '../ot-articles.model';
import { OtArticlesService } from '../ot-articles.service';
import { ArticleService } from '../../../projectService/article/service/article.service';
import { ArticleAffectationResult, ArticleSelectorModalComponent } from '../../../projectService/article/article-selector-modal.component';

type ModeCreation = 'MODELE' | 'LIBRE';
type AccordionPanel = 'global' | 'mode' | 'modele' | 'client' | 'piecesJointes';

interface PendingPieceJointe {
  tempId: string;
  file: File;
  displayName: string;
  extension: string;
}

const AFFAIRE_STATUT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 15;
const RESPONSABLE_ROLE_CODE = 'MANAGER';
const BON_COMMANDE_STATUT = 'ACTIF';

interface PendingOtArticle {
  tempId: string;
  phaseOtId: number;
  article: IArticle;
  prixPropose: number;
  qteCommandee: number;
}

@Component({
  selector: 'jhi-ot-externe-update',
  templateUrl: './ot-externe-update.component.html',
  styleUrls: ['./ot-externe-update.component.scss'],
})
export class OtExterneUpdateComponent implements OnInit, OnDestroy {
  @ViewChild('clientDetailsModal') clientDetailsModal!: TemplateRef<any>;
  @ViewChild('clientCommandeDetailsModal') clientCommandeDetailsModal!: TemplateRef<any>;

  modeleOtLocked = false;
  phasesArticlesEditMode = true; // true by default (creation mode = always editable)

  allArticles: IArticle[] = [];
  loadingArticles = false;

  otArticlesByPhase: { [phaseOtId: number]: IOtArticles[] } = {};
  loadingOtArticles = false;

  pendingOtArticles: PendingOtArticle[] = [];

  isSaving = false;
  otExterne: IOtExterne | null = null;
  statutOtExterneValues = Object.keys(StatutOtExterne);

  selectedBonCommande: IBonCommande | null = null;

  modeCreation: ModeCreation = 'MODELE';

  // ================================
  // Accordéon (état purement visuel — même pattern que bon-commande-update)
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global', 'mode', 'modele']);

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

  modeleOts: IModelPhaseOT[] = [];
  loadingModeleOts = false;

  selectedModelePhases: IPhaseOt[] = [];
  loadingModelePhases = false;

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

  // ================================
  // Pièces Jointes (upload manuel) — même logique que bon-commande-update
  // ================================
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  uploadingPieceJointe = false;

  // Pièces jointes sélectionnées avant l'enregistrement de l'OT externe
  // (mode création : pas encore de otExterne.id, donc pas d'upload possible tout de suite)
  pendingPieceJointes: PendingPieceJointe[] = [];

  // Aperçu inline pièce jointe
  selectedPjForPreview: IPieceJointe | null = null;

  // Renommer pièce jointe
  showRenamePjModal = false;
  pjToRename: IPieceJointe | null = null;
  renamePjNewName = '';
  renamePjError = '';
  isRenamingPj = false;

  // ================================
  // Scan PjCare — même logique que bon-commande-update
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

  scanAccordionStates: { [key: string]: boolean } = {
    scanSource: true,
    scanParams: true,
  };

  protected readonly affaireSearch$ = new Subject<string>();

  private _pendingDriverFromCookie = '';

  // ================================
  // Information Client — alimentée automatiquement par l'affaire sélectionnée
  // (identique à bon-commande-update : seul clientId est persisté)
  // ================================

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
    protected pieceJointeService: PieceJointeService,
    protected pjCareService: PjCareService,
    protected scanSettingsService: ScanSettingsService,
    protected sanitizer: DomSanitizer,
    protected modalService: NgbModal,
    protected cdr: ChangeDetectorRef,
    protected modelPhaseOTService: ModelPhaseOTService,
    protected otArticlesService: OtArticlesService,
    protected articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.loadResponsables();
    this.loadAffaires(''); // Pré-charge la liste des projets dès l'ouverture du formulaire
    this.loadModeleOts(); // <-- add
    this.loadAllArticles(); // <-- add

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

  private handleArticleSelected(phase: IPhaseOt, result: ArticleAffectationResult): void {
    const otExterneId = this.otExterne?.id;

    if (otExterneId === null || otExterneId === undefined) {
      this.pendingOtArticles = [
        ...this.pendingOtArticles,
        {
          tempId: this.generateRandomId(10),
          phaseOtId: phase.id,
          article: result.article,
          prixPropose: result.prixPropose,
          qteCommandee: result.qteCommandee,
        },
      ];
      return;
    }

    const payload: NewOtArticles = {
      id: null,
      otId: otExterneId,
      articleId: result.article.id,
      prixPropose: result.prixPropose,
      qteCommandee: result.qteCommandee,
      qteRealisee: null,
      dateAffectation: dayjs(),
      phaseOtId: phase.id,
    };

    this.otArticlesService.create(payload).subscribe({
      next: res => {
        const saved = res.body;
        if (saved) {
          const list = this.otArticlesByPhase[phase.id] ?? [];
          this.otArticlesByPhase[phase.id] = [...list, saved];
        }
      },
      error: () => {
        alert("Échec de l'ajout de l'article.");
      },
    });
  }

  private loadAllArticles(): void {
    this.loadingArticles = true;
    this.articleService.query({ size: 1000 }).subscribe({
      next: res => {
        this.allArticles = res.body ?? [];
        this.loadingArticles = false;
      },
      error: () => {
        this.allArticles = [];
        this.loadingArticles = false;
      },
    });
  }

  private loadOtArticles(otExterneId: number): void {
    this.loadingOtArticles = true;

    this.otArticlesService.findByOtId(otExterneId).subscribe({
      next: res => {
        const list = res.body ?? [];
        const grouped: { [phaseOtId: number]: IOtArticles[] } = {};
        list.forEach(oa => {
          if (oa.phaseOtId !== null && oa.phaseOtId !== undefined) {
            grouped[oa.phaseOtId] = grouped[oa.phaseOtId] ?? [];
            grouped[oa.phaseOtId].push(oa);
          }
        });
        this.otArticlesByPhase = grouped;
        this.loadingOtArticles = false;
      },
      error: () => {
        this.otArticlesByPhase = {};
        this.loadingOtArticles = false;
      },
    });
  }

  isExistingOt(): boolean {
    return this.otExterne?.id !== null && this.otExterne?.id !== undefined;
  }

  togglePhasesArticlesEditMode(): void {
    this.phasesArticlesEditMode = !this.phasesArticlesEditMode;
  }

  getArticleById(articleId: number | null | undefined): IArticle | null {
    if (articleId === null || articleId === undefined) {
      return null;
    }
    return this.allArticles.find(a => a.id === articleId) ?? null;
  }

  openArticleModal(phase: IPhaseOt): void {
    const modalRef = this.modalService.open(ArticleSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'article-selector-modal-window',
    });

    modalRef.componentInstance.modalTitle = `Ajouter un article — ${phase.nom ?? ''}`;

    modalRef.result
      .then((result: ArticleAffectationResult) => {
        if (result) {
          this.handleArticleSelected(phase, result);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  removePendingOtArticle(tempId: string): void {
    this.pendingOtArticles = this.pendingOtArticles.filter(p => p.tempId !== tempId);
  }

  pendingOtArticlesForPhase(phaseOtId: number): PendingOtArticle[] {
    return this.pendingOtArticles.filter(p => p.phaseOtId === phaseOtId);
  }

  removeOtArticle(phaseOtId: number, otArticleId: number): void {
    this.otArticlesService.delete(otArticleId).subscribe({
      next: () => {
        this.otArticlesByPhase[phaseOtId] = (this.otArticlesByPhase[phaseOtId] ?? []).filter(a => a.id !== otArticleId);
      },
    });
  }

  onModeleOtSelectChange(): void {
    const id = this.editForm.get('modeleOtId')?.value ?? null;

    this.editForm.get('modeleOtId')?.markAsDirty();
    this.editForm.get('modeleOtId')?.markAsTouched();

    this.loadModelePhases(id);
  }

  loadModeleOts(): void {
    this.loadingModeleOts = true;

    this.modelPhaseOTService.query({ size: 200 }).subscribe({
      next: res => {
        this.modeleOts = res.body ?? [];
        this.loadingModeleOts = false;

        // Le <select> natif ne re-sélectionne pas automatiquement une option
        // ajoutée après que la valeur du FormControl ait déjà été écrite
        // (cas fréquent : le resolver charge l'OT externe avant que cette
        // liste de modèles n'ait fini de se charger). On réapplique donc
        // explicitement la valeur ici pour forcer la ré-sélection visuelle.
        const currentModeleOtId = this.otExterne?.modeleOtId ?? null;
        if (currentModeleOtId !== null && currentModeleOtId !== undefined) {
          this.editForm.get('modeleOtId')?.setValue(currentModeleOtId);
        }
      },
      error: () => {
        this.modeleOts = [];
        this.loadingModeleOts = false;
      },
    });
  }

  loadModelePhases(modeleOtId: number | null): void {
    this.selectedModelePhases = [];

    if (modeleOtId === null || modeleOtId === undefined) {
      return;
    }

    this.loadingModelePhases = true;

    this.modelPhaseOTService.findPhases(modeleOtId).subscribe({
      next: res => {
        this.selectedModelePhases = res.body ?? [];
        this.loadingModelePhases = false;
      },
      error: () => {
        this.selectedModelePhases = [];
        this.loadingModelePhases = false;
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
    if (this.modeleOtLocked) {
      return; // le mode/modèle ne peut plus être changé une fois l'OT créé avec un modèle
    }
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
    this.editForm.get('affaireId')?.markAsDirty();
    this.editForm.get('affaireId')?.markAsTouched();

    this.selectedAffaire = affaire;
    this.selectedAffaireCode = affaire.identifiantUnique ?? null;

    this.loadClientInfo(clientId);
    this.loadClientCommandeInfo(affaire.clientCommande ?? null);
    this.applyResponsableFromAffaire(affaire);
  }

  /**
   * Pré-remplit le champ "Responsable" de l'OT externe avec le responsable
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
      this.editForm.get('affaireId')?.markAsDirty();
      this.editForm.get('affaireId')?.markAsTouched();
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
    this.editForm.get('responsableId')?.markAsDirty();
    this.editForm.get('responsableId')?.markAsTouched();

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
      next: () => this.uploadPendingPieceJointesThenNavigate(otExterneId),
      error: () => this.uploadPendingPieceJointesThenNavigate(otExterneId),
    });
  }

  /**
   * Envoie les pièces jointes mises en attente juste après le premier enregistrement
   * de l'OT externe (qui vient de recevoir son id), puis redirige vers l'édition —
   * même logique que uploadPendingPieceJointesThenRefresh dans bon-commande-update.
   */
  private uploadPendingPieceJointesThenNavigate(otExterneId: number): void {
    const uploadPJs$: Observable<unknown> =
      this.pendingPieceJointes.length === 0
        ? of(null)
        : forkJoin(
            this.pendingPieceJointes.map(p =>
              this.pieceJointeService.uploadPieceJointeOtExterne(p.file, otExterneId, this.generateRandomId(10))
            )
          );

    uploadPJs$.subscribe({
      next: () => {
        this.pendingPieceJointes = [];
        this.persistPendingOtArticlesThenNavigate(otExterneId);
      },
      error: () => {
        alert("Certaines pièces jointes n'ont pas pu être envoyées. Vous pouvez réessayer depuis l'accordéon Pièces Jointes.");
        this.persistPendingOtArticlesThenNavigate(otExterneId);
      },
    });
  }

  private persistPendingOtArticlesThenNavigate(otExterneId: number): void {
    if (this.pendingOtArticles.length === 0) {
      this.router.navigate(['../', otExterneId, 'edit'], {
        relativeTo: this.activatedRoute,
      });
      return;
    }

    const creates = this.pendingOtArticles.map(p =>
      this.otArticlesService.create({
        id: null,
        otId: otExterneId,
        articleId: p.article.id,
        prixPropose: p.prixPropose,
        qteCommandee: p.qteCommandee,
        qteRealisee: null,
        dateAffectation: dayjs(),
        phaseOtId: p.phaseOtId,
      })
    );

    forkJoin(creates).subscribe({
      next: () => {
        this.pendingOtArticles = [];
        this.router.navigate(['../', otExterneId, 'edit'], {
          relativeTo: this.activatedRoute,
        });
      },
      error: () => {
        alert("Certains articles n'ont pas pu être associés. Vous pouvez réessayer depuis l'accordéon Modèle OT et phases.");
        this.router.navigate(['../', otExterneId, 'edit'], {
          relativeTo: this.activatedRoute,
        });
      },
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
      this.loadModelePhases(otExterne.modeleOtId!); // <-- add
      this.loadOtArticles(otExterne.id); // <-- add
      this.loadAutresResponsables(otExterne.id);
      this.loadPieceJointes(otExterne.id);
    }

    // Verrouillage du modèle OT + passage en lecture seule pour phases/articles
    if (otExterne.modeleOtId !== null && otExterne.modeleOtId !== undefined) {
      this.modeleOtLocked = true;
      this.editForm.get('modeleOtId')?.disable();
      this.phasesArticlesEditMode = false; // lecture seule par défaut à l'ouverture
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

  // ================================
  // Pièces Jointes — chargement, upload — même logique que bon-commande-update
  // ================================
  private loadPieceJointes(otExterneId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findByOtExterne(otExterneId).subscribe({
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
    const otExterneId = this.otExterne?.id;

    // OT externe pas encore enregistré : on met le fichier de côté,
    // il sera réellement envoyé juste après le premier enregistrement (cf. onSaveSuccess).
    if (otExterneId === null || otExterneId === undefined) {
      this.stagePendingPieceJointe(file);
      return;
    }

    const uniqueName = this.generateRandomId(10);
    this.uploadingPieceJointe = true;

    this.pieceJointeService.uploadPieceJointeOtExterne(file, otExterneId, uniqueName).subscribe({
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
  // Scan PjCare — même logique que bon-commande-update
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
        name: 'ot-externe',
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

    // Remarque : si l'OT externe n'est pas encore enregistré, _attachRawResult()
    // → uploadFile() met le scan en attente au lieu de l'envoyer immédiatement.

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
        name: 'ot-externe',
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
