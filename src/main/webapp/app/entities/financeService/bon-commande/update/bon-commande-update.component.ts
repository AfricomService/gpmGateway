import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { BonCommandeFormService, BonCommandeFormGroup } from './bon-commande-form.service';
import { IBonCommande } from '../bon-commande.model';
import { BonCommandeService } from '../service/bon-commande.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService, RestPage } from 'app/entities/projectService/affaire/service/affaire.service';
import { IArticle } from 'app/entities/projectService/article/article.model';
import { AffaireSelectorModalComponent } from '../affaire-selector-modal/affaire-selector-modal.component';
import { ContactSelectorModalComponent } from '../contact-selector-modal/contact-selector-modal.component';
import { SiteSelectorModalComponent } from '../site-selector-modal/site-selector-modal.component';
import { ArticleSelectorModalComponent, ArticleSelection } from '../article-selector-modal/article-selector-modal.component';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { BonCommandeAutreResponsableService } from '../service/bon-commande-autre-responsable.service';
import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { IBonCommandeArticles } from '../bon-commande-articles.model';
import { BonCommandeArticlesService } from '../service/bon-commande-articles.service';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';
import { IPieceJointe } from 'app/entities/projectService/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/projectService/piece-jointe/service/piece-jointe.service';
import { PjCareService, PjCareDriverInfo, ScanDriver, ScannedPage } from 'app/entities/projectService/piece-jointe/service/pjcare.service';
import { ScanSettingsService } from 'app/entities/projectService/piece-jointe/service/scan-settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';

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
  @ViewChild('clientDetailsModal') clientDetailsModal!: TemplateRef<any>;
  @ViewChild('clientCommandeDetailsModal') clientCommandeDetailsModal!: TemplateRef<any>;

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

  selectedAutresResponsables: IContactSociete[] = []; // Sélection multiple, persistée via BonCommandeAutreResponsable

  // Infos client — affichage uniquement, seul clientId est persisté (formControlName)
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  // Sites associés au client final — alimente la liste déroulante "Lieu"
  clientSites: ISite[] = [];
  loadingClientSites = false;

  // Infos client commande — affichage uniquement, alimenté par affaire.clientCommande (non persisté sur BonCommande)
  selectedClientCommandeInfo: IClient | null = null;
  loadingClientCommandeInfo = false;

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

  // ================================
  // Articles sélectionnés pour le Bon de Commande (accordéon "Détails Commande")
  // ================================
  chosenArticles: ArticleSelection[] = [];

  // ================================
  // Pièces Jointes (upload manuel + scan PjCare)
  // ================================
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  uploadingPieceJointe = false;

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

  // ================================
  // Aperçu inline pièce jointe
  // ================================
  selectedPjForPreview: IPieceJointe | null = null;

  // ================================
  // Renommer pièce jointe
  // ================================
  showRenamePjModal = false;
  pjToRename: IPieceJointe | null = null;
  renamePjNewName = '';
  renamePjError = '';
  isRenamingPj = false;

  constructor(
    protected bonCommandeService: BonCommandeService,
    protected bonCommandeFormService: BonCommandeFormService,
    protected activatedRoute: ActivatedRoute,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected siteService: SiteService,
    protected modalService: NgbModal,
    protected bonCommandeAutreResponsableService: BonCommandeAutreResponsableService,
    protected bonCommandeArticlesService: BonCommandeArticlesService,
    protected articleService: ArticleService,
    protected pieceJointeService: PieceJointeService,
    protected pjCareService: PjCareService,
    protected scanSettingsService: ScanSettingsService,
    protected sanitizer: DomSanitizer,
    protected cdr: ChangeDetectorRef
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
    this.loadClientCommandeInfo(affaire.clientCommande ?? null);

    // Un nouveau projet a été choisi : la sélection précédente ne correspond plus à ce projet
    this.chosenArticles = [];
  }

  /**
   * Appelé directement par le (change) du ng-select Affaire.
   * `null` signifie que l'utilisateur a vidé la sélection.
   */
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
      this.chosenArticles = [];
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
      this.clientSites = [];
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

        // Force la mise à jour de la vue même si l'accordéon "Information Client"
        // est fermé au moment où la réponse arrive (sinon le champ "Client" reste
        // vide tant qu'un autre événement ne déclenche pas de détection de changement).
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
   * pour alimenter la liste déroulante "Lieu".
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

  /**
   * Récupère les infos du client commande (affaire.clientCommande) via GET /api/clients/{id}.
   * Affichage uniquement — ce champ n'est pas persisté avec le BonCommande.
   */
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
  // Autres Responsables (sélection multiple, persistée via BonCommandeAutreResponsable)
  // ================================
  onAutreResponsableSelectChange(responsables: IContactSociete[] | null): void {
    this.selectedAutresResponsables = responsables ?? [];
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

  openArticleModal(): void {
    const modalRef = this.modalService.open(ArticleSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'article-selector-modal-window',
    });

    modalRef.componentInstance.affaireId = this.selectedAffaire?.id ?? null;
    modalRef.componentInstance.initialSelection = this.chosenArticles;

    modalRef.result
      .then((selection: ArticleSelection[]) => {
        this.chosenArticles = selection ?? [];
      })
      .catch(() => {
        // Fermeture du modal sans validation
      });
  }

  removeChosenArticle(articleId: number): void {
    this.chosenArticles = this.chosenArticles.filter(sel => sel.article.id !== articleId);
  }

  onChosenArticleQuantityChange(articleId: number, qte: number | string): void {
    const parsed = Number(qte);
    const target = this.chosenArticles.find(sel => sel.article.id === articleId);
    if (target) {
      target.qte = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
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
  // Détails Client / Client Demandeur (modals)
  // ================================
  openClientDetailsModal(): void {
    this.modalService.open(this.clientDetailsModal, { size: 'md', centered: true });
  }

  openClientCommandeDetailsModal(): void {
    this.modalService.open(this.clientCommandeDetailsModal, { size: 'md', centered: true });
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
      this.bonCommandeService.generateIdentifiantBonCommande().subscribe({
        next: res => {
          bonCommande.identifiantUnique = res.body;
          this.subscribeToSaveResponse(this.bonCommandeService.create(bonCommande));
        },
        error: () => {
          this.onSaveFinalize();
        },
      });
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBonCommande>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: res => this.onSaveSuccess(res.body),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(bonCommande?: IBonCommande | null): void {
    this.bonCommande = bonCommande ?? this.bonCommande;

    const bonCommandeId = bonCommande?.id;

    if (bonCommandeId === null || bonCommandeId === undefined) {
      return;
    }

    const contactSocieteIds = this.selectedAutresResponsables.map(c => c.id).filter((id): id is number => id !== null && id !== undefined);

    const articlesToSave: Partial<IBonCommandeArticles>[] = this.chosenArticles
      .filter(sel => sel.article.id !== null && sel.article.id !== undefined)
      .map(sel => ({
        articleId: sel.article.id as number,
        qteCommande: sel.qte,
      }));

    forkJoin([
      this.bonCommandeAutreResponsableService.replaceForBonCommande(bonCommandeId, contactSocieteIds),
      this.bonCommandeArticlesService.replaceForBonCommande(bonCommandeId, articlesToSave),
    ]).subscribe({
      // On reste sur l'interface d'édition : on recharge simplement les données
      // à jour (pièces jointes, articles, autres responsables...) au lieu de
      // rediriger vers la liste des bons de commande.
      next: () => this.refreshAfterSave(bonCommandeId),
      error: () => this.refreshAfterSave(bonCommandeId),
    });
  }

  /**
   * Recharge les données du bon de commande après un enregistrement réussi,
   * sans quitter l'interface d'édition. Utile notamment lors de la création
   * (premier enregistrement) : bonCommande.id devient alors disponible et
   * les accordéons dépendants (pièces jointes, articles, etc.) peuvent
   * être activés/rafraîchis normalement.
   */
  private refreshAfterSave(bonCommandeId: number): void {
    this.bonCommandeService.find(bonCommandeId).subscribe({
      next: res => {
        if (res.body) {
          this.updateForm(res.body);
        }
        this.cdr.detectChanges();
      },
    });
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

    // ================================
    // Infos client — on essaie toutes les sources disponibles, dans l'ordre
    // de fiabilité, et on charge dès qu'on a un id valide, sans attendre
    // le retour (asynchrone, potentiellement incomplet) de l'appel affaire.
    // ================================
    const resolveInitialClientId = (): number | null => {
      const fromBonCommande = bonCommande.clientId;
      if (fromBonCommande !== null && fromBonCommande !== undefined && fromBonCommande !== ('' as any)) {
        const n = Number(fromBonCommande);
        if (!Number.isNaN(n)) {
          return n;
        }
      }

      const fromForm = this.editForm.get('clientId')?.value;
      if (fromForm !== null && fromForm !== undefined) {
        const n = Number(fromForm);
        if (!Number.isNaN(n)) {
          return n;
        }
      }

      return null;
    };

    const initialClientId = resolveInitialClientId();

    if (initialClientId !== null) {
      this.loadClientInfo(initialClientId);
    } else {
      console.warn('[BonCommande][edit] Aucun clientId trouvé ni sur bonCommande, ni sur le form après resetForm.', bonCommande);
    }

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

            this.loadClientCommandeInfo(affaire.clientCommande ?? null);

            // Filet de sécurité : si aucune des sources précédentes n'a donné de
            // clientId, on retente via le client rattaché à l'affaire.
            if (initialClientId === null) {
              const clientIdFromAffaire = affaire.client?.id ?? null;
              if (clientIdFromAffaire !== null) {
                this.loadClientInfo(clientIdFromAffaire);
              } else {
                console.warn('[BonCommande][edit] affaire.client est également absent/null.', affaire);
              }
            }
          }
        },
        error: err => console.error('[BonCommande][edit] Erreur lors du chargement de l’affaire', err),
      });
    }

    // Libellé du responsable pour affichage — le formulaire ne persiste que l'id
    const responsableId = bonCommande.responsableId;

    if (responsableId !== null && responsableId !== undefined && responsableId !== '') {
      this.loadResponsableLabel(Number(responsableId));
    }

    // Autres responsables (sélection multiple) — chargés via la table de liaison
    if (bonCommande.id !== null && bonCommande.id !== undefined) {
      this.loadAutresResponsables(bonCommande.id);
      this.loadBonCommandeArticles(bonCommande.id);
      this.loadPieceJointes(bonCommande.id);
    }
  }

  // ================================
  // Pièces Jointes — chargement, upload, scan PjCare
  // ================================
  private loadPieceJointes(bonCommandeId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findByBonCommande(bonCommandeId).subscribe({
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

  // ================================
  // Aperçu inline pièce jointe
  // ================================
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
    const bonCommandeId = this.bonCommande?.id;
    if (bonCommandeId === null || bonCommandeId === undefined) {
      alert("Veuillez d'abord enregistrer le bon de commande avant d'ajouter une pièce jointe.");
      return;
    }

    const uniqueName = this.generateRandomId(10);
    this.uploadingPieceJointe = true;

    this.pieceJointeService.uploadPieceJointe(file, bonCommandeId, uniqueName).subscribe({
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

  // -------- PjCare : scan --------
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
    this.modalService.open(content, { size: 'lg' });
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
        name: 'bon-commande',
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

    const bonCommandeId = this.bonCommande?.id;
    if (bonCommandeId === null || bonCommandeId === undefined) {
      this.scanError = "Veuillez d'abord enregistrer le bon de commande avant d'attacher un scan.";
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
        name: 'bon-commande',
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

  private loadAutresResponsables(bonCommandeId: number): void {
    this.bonCommandeAutreResponsableService.findByBonCommande(bonCommandeId).subscribe({
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

  /**
   * Charge les affectations existantes (articles déjà liés à ce BC) pour pré-remplir
   * l'accordéon "Détails Commande" en mode édition. Récupère le détail complet de
   * chaque article (désignation, prix...) via ArticleService, car la table de liaison
   * ne stocke que l'id et la quantité.
   */
  private loadBonCommandeArticles(bonCommandeId: number): void {
    this.bonCommandeArticlesService.findByBonCommande(bonCommandeId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const validLinks = links.filter(
          (l): l is IBonCommandeArticles & { articleId: number } => l.articleId !== null && l.articleId !== undefined
        );

        if (validLinks.length === 0) {
          this.chosenArticles = [];
          return;
        }

        forkJoin(validLinks.map(l => this.articleService.find(l.articleId))).subscribe({
          next: responses => {
            this.chosenArticles = responses
              .map((res2, index) => ({ article: res2.body, qte: validLinks[index].qteCommande ?? 1 }))
              .filter((sel): sel is ArticleSelection => sel.article !== null);
          },
          error: () => {
            this.chosenArticles = [];
          },
        });
      },
      error: () => {
        this.chosenArticles = [];
      },
    });
  }
}
