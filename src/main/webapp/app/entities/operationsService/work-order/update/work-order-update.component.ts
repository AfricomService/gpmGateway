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
import { StatusStep } from 'app/shared/status-stepper/status-stepper.component';
import { StatusStepperService } from 'app/shared/status-stepper/status-stepper.service';

import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { WorkOrderTechniciensService } from '../service/work-order-techniciens.service';
import { IVehicule } from 'app/entities/projectService/vehicule/vehicule.model';
import { VehiculeService } from 'app/entities/projectService/vehicule/service/vehicule.service';
import { WorkOrderVehiculeService } from '../service/work-order-vehicule.service';
import { forkJoin, EMPTY } from 'rxjs';

import { AffaireSelectorModalComponent } from 'app/entities/financeService/bon-commande/affaire-selector-modal/affaire-selector-modal.component';
import { SiteSelectorModalComponent } from 'app/entities/financeService/bon-commande/site-selector-modal/site-selector-modal.component';
import { ContactSelectorModalComponent } from 'app/entities/financeService/bon-commande/contact-selector-modal/contact-selector-modal.component';
import { VehiculeSelectorModalComponent } from 'app/entities/operationsService/work-order/vehicule-selector-modal/vehicule-selector-modal.component';
import { RessourceSelectorModalComponent } from 'app/entities/operationsService/work-order/ressource-selector-modal/ressource-selector-modal.component';
import { IRessource } from 'app/entities/projectService/ressource/ressource.model';
import { RessourceService } from 'app/entities/projectService/ressource/service/ressource.service';
import { WorkOrderRessourceService } from '../service/work-order-ressource.service';
import { IPieceJointe } from 'app/entities/projectService/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/projectService/piece-jointe/service/piece-jointe.service';
import { PjCareService, PjCareDriverInfo, ScanDriver, ScannedPage } from 'app/entities/projectService/piece-jointe/service/pjcare.service';
import { ScanSettingsService } from 'app/entities/projectService/piece-jointe/service/scan-settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs/esm';
import { IModelPhaseOT } from 'app/entities/financeService/model-phase-ot/model-phase-ot.model';
import { ModelPhaseOTService } from 'app/entities/financeService/model-phase-ot/service/model-phase-ot.service';
import { IOtExterne } from 'app/entities/financeService/ot-externe/ot-externe.model';
import { OtExterneService } from 'app/entities/financeService/ot-externe/service/ot-externe.service';
import { OtExterneSelectorModalComponent } from 'app/entities/operationsService/work-order/ot-externe-selector-modal/ot-externe-selector-modal.component';
import { BonCommandeSelectorModalComponent } from 'app/entities/operationsService/work-order/bon-commande-selector-modal/bon-commande-selector-modal.component';
import { IBonCommande } from 'app/entities/financeService/bon-commande/bon-commande.model';
import { IParametreWO } from 'app/entities/operationsService/parametre-wo/parametre-wo.model';
import { ParametreWOService } from 'app/entities/operationsService/parametre-wo/service/parametre-wo.service';
import { ParametrageDeplacementService } from 'app/entities/operationsService/parametrage-deplacement/service/parametrage-deplacement.service';
import { NewParametrageDeplacement } from 'app/entities/operationsService/parametrage-deplacement/parametrage-deplacement.model';

type AccordionPanel = 'global' | 'client' | 'equipes' | 'options' | 'remarque' | 'piecesJointes';

interface PendingPieceJointe {
  tempId: string;
  file: File;
  displayName: string;
  extension: string;
}

const AFFAIRE_STATUT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 15;
const OT_EXTERNE_PAGE_SIZE = 15;
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

  // Cycle de vie affiché dans le stepper (ordre = ordre du workflow)
  readonly statutSteps: StatusStep[] = [
    { key: StatutWO.Creation, label: 'Création' },
    { key: StatutWO.ExecutionTravaux, label: 'Exécution travaux' },
    { key: StatutWO.VerificationWO, label: 'Vérification WO' },
    { key: StatutWO.ValidationTechnique, label: 'Validation technique' },
    { key: StatutWO.ValidationRessources, label: 'Validation ressources' },
    { key: StatutWO.Fin, label: 'Fin' },
  ];

  get currentStatut(): string {
    return (this.editForm.get('statut')?.value as string | null | undefined) ?? StatutWO.Creation;
  }

  /**
   * Liste des jours (calendaires, bornes incluses) entre Date Heure Début Prév. et Date Heure Fin Prév.
   * Ex. : début 30/10/2026 08:00, fin 01/11/2026 18:00 => ['30/10/2026', '31/10/2026', '01/11/2026'].
   * Retourne [] si une date manque, est invalide, ou si la fin précède le début.
   */
  get joursPrevusDates(): dayjs.Dayjs[] {
    const debutValue = this.editForm.get('dateHeureDebutPrev')?.value;
    const finValue = this.editForm.get('dateHeureFinPrev')?.value;

    if (!debutValue || !finValue) {
      return [];
    }

    const debut = dayjs(debutValue as any).startOf('day');
    const fin = dayjs(finValue as any).startOf('day');

    if (!debut.isValid() || !fin.isValid() || fin.isBefore(debut)) {
      return [];
    }

    const nbJours = fin.diff(debut, 'day') + 1;
    return Array.from({ length: nbJours }, (_, i) => debut.add(i, 'day'));
  }

  get joursPrevus(): string[] {
    return this.joursPrevusDates.map(jour => jour.format('DD/MM/YYYY'));
  }

  get nombreJoursPrevus(): number {
    return this.joursPrevus.length;
  }

  // Compteurs calculés à partir des checkpoints cochés (un jour coché = +1)
  get nombreHebergements(): number {
    return this.countChecked('Hébergement');
  }

  get nombreNuits(): number {
    return this.countChecked('Mission de nuit');
  }

  get nombreDeplacements(): number {
    return this.countChecked('Déplacement');
  }

  private normalizeText(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  /** Nombre de jours pour lesquels le paramètre portant ce nom est coché (comparaison sans accents ni casse). */
  private countChecked(nomParametre: string): number {
    const cible = this.normalizeText(nomParametre);
    const parametre = this.parametresWO.find(p => this.normalizeText(p.nom) === cible);

    if (!parametre) {
      return 0;
    }

    return this.joursPrevusDates.filter((_, index) => this.isParametreChecked(index, parametre)).length;
  }

  // ================================
  // Paramètres WO (Hébergement, Mission de nuit, Déplacement...) affichés pour chaque jour
  // Checkpoints : état local pour l'instant (persistance à venir). Clé = `${indexJour}_${parametreId}`
  // ================================
  parametresWO: IParametreWO[] = [];
  loadingParametresWO = false;
  parametreChecks: { [key: string]: boolean } = {};

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

  // Site actuellement sélectionné pour le champ "Lieu" — sert aussi à dériver
  // automatiquement Ville et Zone (site -> zone -> ville), sans appel API supplémentaire
  // car SiteDTO renvoie déjà ville {id, nom} et zoneNom/zoneId.
  selectedSite: ISite | null = null;

  // ================================
  // Liste déroulante Modèle de phases (ModelPhaseOT — GET /api/model-phase-ots/all)
  // ================================
  modelPhases: IModelPhaseOT[] = [];
  selectedModelPhase: IModelPhaseOT | null = null;
  loadingModelPhases = false;

  // ================================
  // Liste déroulante OT Externe (filtrée par le Motif = ModelPhaseOT sélectionné, via modeleOtId)
  // ================================
  otExterneResults: IOtExterne[] = [];
  selectedOtExterne: IOtExterne | null = null;
  loadingOtExternes = false;
  otExterneSearchTerm = '';
  otExternePage = 0;
  otExterneTotalItems = 0;
  otExterneError = '';
  private otExterneErrorTimeoutId?: ReturnType<typeof setTimeout>;

  protected readonly otExterneSearch$ = new Subject<string>();

  // ================================
  // Bon de commande — alimenté automatiquement par l'OT externe sélectionné (lecture seule)
  // ================================
  selectedBonCommande: IBonCommande | null = null;
  loadingBonCommande = false;

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
  // Véhicules (sélection multiple, persistée via WorkOrderVehicule) — même logique que les Techniciens
  // ================================
  vehicules: IVehicule[] = [];
  selectedVehicules: IVehicule[] = [];
  loadingVehicules = false;
  vehiculeError = '';
  private vehiculeErrorTimeoutId?: ReturnType<typeof setTimeout>;

  // ================================
  // Ressources (sélection multiple, persistée via WorkOrderRessource) — même logique que les Véhicules
  // ================================
  ressources: IRessource[] = [];
  selectedRessources: IRessource[] = [];
  loadingRessources = false;
  ressourceError = '';
  private ressourceErrorTimeoutId?: ReturnType<typeof setTimeout>;

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
    protected vehiculeService: VehiculeService,
    protected workOrderVehiculeService: WorkOrderVehiculeService,
    protected ressourceService: RessourceService,
    protected workOrderRessourceService: WorkOrderRessourceService,
    protected pieceJointeService: PieceJointeService,
    protected pjCareService: PjCareService,
    protected scanSettingsService: ScanSettingsService,
    protected sanitizer: DomSanitizer,
    protected modalService: NgbModal,
    protected cdr: ChangeDetectorRef,
    protected stepperService: StatusStepperService,
    protected modelPhaseOTService: ModelPhaseOTService,
    protected otExterneService: OtExterneService,
    protected parametreWOService: ParametreWOService,
    protected parametrageDeplacementService: ParametrageDeplacementService
  ) {}

  ngOnInit(): void {
    // Cycle de vie affiché sous le breadcrumb (rendu par MainComponent)
    this.stepperService.show(this.statutSteps, this.currentStatut);
    this.editForm.get('statut')?.valueChanges.subscribe(() => this.stepperService.show(this.statutSteps, this.currentStatut));

    this.loadResponsables();
    this.loadTechniciens();
    this.loadModelPhases();
    this.loadParametresWO();
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

    // Recherche OT externe avec debounce (filtrée par le motif sélectionné)
    this.otExterneSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(search => {
          const modeleOtId = this.selectedModelPhase?.id;
          this.otExterneSearchTerm = search;
          this.otExternePage = 0;

          if (modeleOtId === null || modeleOtId === undefined) {
            return EMPTY;
          }

          this.loadingOtExternes = true;
          return this.otExterneService.findByModeleOt(modeleOtId, {
            page: this.otExternePage,
            size: OT_EXTERNE_PAGE_SIZE,
            sort: ['reference,asc'],
            search,
          });
        })
      )
      .subscribe({
        next: res => this.onOtExternePageLoaded(res, true),
        error: () => {
          this.loadingOtExternes = false;
          this.otExterneResults = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.affaireSearch$.complete();
    this.otExterneSearch$.complete();
    if (this.otExterneErrorTimeoutId) {
      clearTimeout(this.otExterneErrorTimeoutId);
    }
    this.stepperService.clear(); // le stepper disparaît en quittant la page
    if (this.technicienErrorTimeoutId) {
      clearTimeout(this.technicienErrorTimeoutId);
    }
    if (this.vehiculeErrorTimeoutId) {
      clearTimeout(this.vehiculeErrorTimeoutId);
    }
    if (this.ressourceErrorTimeoutId) {
      clearTimeout(this.ressourceErrorTimeoutId);
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
    const societeId = (affaire as any).societeId ?? null;

    this.editForm.patchValue({
      affaireId: affaire.id,
      clientId,
      lieu: null,
      villeId: null,
      zoneId: null,
      siteId: null,
    });

    this.selectedAffaire = affaire;
    this.selectedAffaireCode = affaire.identifiantUnique ?? null;
    this.selectedSite = null;

    this.loadClientInfo(clientId);
    this.loadClientCommandeInfo(affaire.clientCommande ?? null);
    this.applyResponsableFromAffaire(affaire);

    // Recharge les listes véhicules/ressources filtrées sur la société de l'affaire sélectionnée
    this.loadVehicules(societeId);
    this.loadRessources(societeId);
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
      this.editForm.patchValue({ affaireId: null, clientId: null, lieu: null, villeId: null, zoneId: null, siteId: null });
      this.selectedAffaire = null;
      this.selectedAffaireCode = null;
      this.selectedClientInfo = null;
      this.selectedClientCommandeInfo = null;
      this.selectedSite = null;
      this.clientSites = [];
      this.vehicules = [];
      this.ressources = [];
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

        // Mode édition : on retrouve le site par son id (siteId), fiable et stable.
        // Filet de sécurité pour les WorkOrder enregistrés avant l'ajout de siteId :
        // on retombe alors sur l'ancien matching par désignation.
        const siteId = this.editForm.get('siteId')?.value;
        const lieu = this.editForm.get('lieu')?.value;

        this.selectedSite = siteId
          ? this.clientSites.find(s => s.id === siteId) ?? null
          : lieu
          ? this.clientSites.find(s => s.designation === lieu) ?? null
          : null;

        if (siteId && !this.selectedSite) {
          console.warn(`[WorkOrder][edit] Site id=${siteId} introuvable parmi les sites du client ${clientId}.`, this.clientSites);
        }

        if (lieu && !this.selectedSite) {
          console.warn(
            `[WorkOrder][edit] Aucun site trouvé pour lieu="${this.editForm.get('lieu')?.value}" parmi ${
              this.clientSites.length
            } site(s) du client ${clientId}.`,
            this.clientSites
          );
        }
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

  compareVehicule = (a: IVehicule | null, b: IVehicule | null): boolean => (a && b ? a.id === b.id : a === b);

  compareRessource = (a: IRessource | null, b: IRessource | null): boolean => (a && b ? a.id === b.id : a === b);

  compareSite = (a: ISite | null, b: ISite | null): boolean => (a && b ? a.id === b.id : a === b);

  private loadResponsableLabel(responsableId: number): void {
    this.bonCommandeService.findResponsableById(responsableId).subscribe({
      next: res => {
        this.selectedResponsable = res.body ?? null;
      },
    });
  }

  // ================================
  // Modèle de phases (ModelPhaseOT)
  // ================================
  private loadModelPhases(): void {
    this.loadingModelPhases = true;

    this.modelPhaseOTService.findAll().subscribe({
      next: res => {
        this.modelPhases = res.body ?? [];
        this.loadingModelPhases = false;
      },
      error: () => {
        this.modelPhases = [];
        this.loadingModelPhases = false;
      },
    });
  }

  compareModelPhase = (a: IModelPhaseOT | null, b: IModelPhaseOT | null): boolean => (a && b ? a.id === b.id : a === b);

  onModelPhaseSelectChange(modelPhase: IModelPhaseOT | null): void {
    this.selectedModelPhase = modelPhase;

    // Le motif a changé : l'OT externe précédemment choisi n'est plus valide
    this.selectedOtExterne = null;
    this.editForm.patchValue({ otExterneId: null });
    this.resetBonCommande();
    this.otExterneResults = [];
    this.otExterneTotalItems = 0;
    this.otExterneSearchTerm = '';

    if (modelPhase?.id !== null && modelPhase?.id !== undefined) {
      this.loadOtExternes('');
    }
  }

  // ================================
  // OT Externe (liste filtrée par modeleOtId = motif sélectionné)
  // ================================
  private loadOtExternes(search: string): void {
    const modeleOtId = this.selectedModelPhase?.id;

    if (modeleOtId === null || modeleOtId === undefined) {
      this.otExterneResults = [];
      return;
    }

    this.otExternePage = 0;
    this.loadingOtExternes = true;

    this.otExterneService
      .findByModeleOt(modeleOtId, { page: this.otExternePage, size: OT_EXTERNE_PAGE_SIZE, sort: ['reference,asc'], search })
      .subscribe({
        next: res => this.onOtExternePageLoaded(res, true),
        error: () => {
          this.loadingOtExternes = false;
          this.otExterneResults = [];
        },
      });
  }

  onOtExterneScrollToEnd(): void {
    const modeleOtId = this.selectedModelPhase?.id;
    const hasMore = this.otExterneResults.length < this.otExterneTotalItems;

    if (modeleOtId !== null && modeleOtId !== undefined && hasMore && !this.loadingOtExternes) {
      this.otExternePage += 1;
      this.loadingOtExternes = true;

      this.otExterneService
        .findByModeleOt(modeleOtId, {
          page: this.otExternePage,
          size: OT_EXTERNE_PAGE_SIZE,
          sort: ['reference,asc'],
          search: this.otExterneSearchTerm,
        })
        .subscribe({
          next: res => this.onOtExternePageLoaded(res, false),
          error: () => {
            this.loadingOtExternes = false;
          },
        });
    }
  }

  compareOtExterne = (a: IOtExterne | null, b: IOtExterne | null): boolean => (a && b ? a.id === b.id : a === b);

  private onOtExternePageLoaded(res: HttpResponse<IOtExterne[]>, reset: boolean): void {
    const items = res.body ?? [];

    this.otExterneTotalItems = Number(res.headers.get('X-Total-Count') ?? items.length);
    this.otExterneResults = reset ? items : [...this.otExterneResults, ...items];
    this.loadingOtExternes = false;
  }

  onOtExterneSelectChange(otExterne: IOtExterne | null): void {
    this.editForm.patchValue({ otExterneId: otExterne?.id ?? null });
    this.selectedOtExterne = otExterne;

    if (otExterne?.id !== null && otExterne?.id !== undefined) {
      this.loadBonCommandeByOtExterne(otExterne.id);
    } else {
      this.resetBonCommande();
    }
  }

  private resetBonCommande(): void {
    this.selectedBonCommande = null;
    this.loadingBonCommande = false;
    this.editForm.patchValue({ bonCommandeId: null });
  }

  /**
   * Applique un bon de commande (valeur auto depuis l'OT externe OU choix manuel via le modal)
   * et le met dans le formulaire pour qu'il soit persisté (WorkOrder.bonCommandeId).
   */
  private applyBonCommande(bonCommande: IBonCommande | null): void {
    this.selectedBonCommande = bonCommande;
    this.loadingBonCommande = false;
    this.editForm.patchValue({ bonCommandeId: bonCommande?.id ?? null });
    this.editForm.get('bonCommandeId')?.markAsDirty();
    this.cdr.detectChanges();
  }

  /**
   * Récupère le bon de commande lié à l'OT externe (GET /api/bon-commandes/by-ot-externe/{id}).
   * Relation many-to-one : un OT externe a au plus un bon de commande.
   * La valeur obtenue sert de valeur par défaut, modifiable ensuite via le modal.
   */
  private loadBonCommandeByOtExterne(otExterneId: number): void {
    this.resetBonCommande();
    this.loadingBonCommande = true;

    this.bonCommandeService.findByOtExterne(otExterneId).subscribe({
      next: res => this.applyBonCommande(res.body ?? null),
      error: () => {
        // 404 : aucun bon de commande lié à cet OT externe
        this.resetBonCommande();
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Mode édition : charge le bon de commande PERSISTÉ sur le work order (GET /api/bon-commandes/{id}).
   * Ne touche pas au formulaire : bonCommandeId vient déjà de resetForm().
   */
  private loadBonCommandeLabel(bonCommandeId: number): void {
    this.loadingBonCommande = true;

    this.bonCommandeService.find(bonCommandeId).subscribe({
      next: res => {
        this.selectedBonCommande = res.body ?? null;
        this.loadingBonCommande = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedBonCommande = null;
        this.loadingBonCommande = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Ouvre le modal de sélection (liste paginée + recherche backend) pour remplacer
   * le bon de commande rempli automatiquement par l'OT externe.
   */
  openBonCommandeModal(): void {
    const modalRef = this.modalService.open(BonCommandeSelectorModalComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'affaire-selector-modal-window',
    });

    modalRef.componentInstance.selectedId = this.selectedBonCommande?.id ?? null;

    modalRef.result
      .then((bonCommande: IBonCommande) => {
        if (bonCommande) {
          this.applyBonCommande(bonCommande);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  private showOtExterneError(message: string): void {
    this.otExterneError = message;

    if (this.otExterneErrorTimeoutId) {
      clearTimeout(this.otExterneErrorTimeoutId);
    }

    this.otExterneErrorTimeoutId = setTimeout(() => {
      this.otExterneError = '';
      this.otExterneErrorTimeoutId = undefined;
    }, 4000);
  }

  openOtExterneModal(): void {
    const modeleOtId = this.selectedModelPhase?.id;

    if (modeleOtId === null || modeleOtId === undefined) {
      this.showOtExterneError("Veuillez d'abord sélectionner un motif avant de choisir un OT externe.");
      return;
    }

    const modalRef = this.modalService.open(OtExterneSelectorModalComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'ot-externe-selector-modal-window',
    });

    modalRef.componentInstance.modeleOtId = modeleOtId;
    modalRef.componentInstance.modalTitle = 'Sélectionner un OT externe';

    modalRef.result
      .then((otExterne: IOtExterne) => {
        if (otExterne) {
          if (!this.otExterneResults.some(o => o.id === otExterne.id)) {
            this.otExterneResults = [otExterne, ...this.otExterneResults];
          }
          this.onOtExterneSelectChange(otExterne);
        }
      })
      .catch(() => {
        // Fermeture du modal sans sélection
      });
  }

  /**
   * Mode édition : retrouve l'OT externe enregistré, puis restaure le Motif (via otExterne.modeleOtId).
   * Le motif n'est pas persisté sur le work order, il est donc déduit de l'OT externe.
   */
  private loadOtExterneLabel(otExterneId: number): void {
    this.otExterneService.find(otExterneId).subscribe({
      next: res => {
        const otExterne = res.body ?? null;
        this.selectedOtExterne = otExterne;

        if (!otExterne) {
          return;
        }

        if (!this.otExterneResults.some(o => o.id === otExterne.id)) {
          this.otExterneResults = [otExterne, ...this.otExterneResults];
        }

        const modeleOtId = otExterne.modeleOtId;
        if (modeleOtId !== null && modeleOtId !== undefined) {
          this.modelPhaseOTService.find(modeleOtId).subscribe({
            next: mpRes => {
              this.selectedModelPhase = mpRes.body ?? null;
              this.cdr.detectChanges();
            },
          });
        }

        this.cdr.detectChanges();
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
  // Paramètres WO (GET /api/parametre-wos) + checkpoints par jour
  // ================================
  private loadParametresWO(): void {
    this.loadingParametresWO = true;

    this.parametreWOService.query().subscribe({
      next: res => {
        this.parametresWO = res.body ?? [];
        this.loadingParametresWO = false;
      },
      error: () => {
        this.parametresWO = [];
        this.loadingParametresWO = false;
      },
    });
  }

  private parametreKey(jourIndex: number, parametre: IParametreWO): string {
    const jour = this.joursPrevusDates[jourIndex];
    return `${jour ? jour.format('YYYY-MM-DD') : jourIndex}_${parametre.nom}`;
  }

  /**
   * Construit une ligne par jour : { workOrderId, date, params: { Hébergement: true, "Mission de nuit": false, ... } }.
   * La date est fixée à 12:00 (heure locale) pour que le jour reste le même quel que soit le fuseau lors de la conversion UTC.
   */
  private buildParametrages(workOrderId: number): NewParametrageDeplacement[] {
    return this.joursPrevusDates.map((jour, index) => {
      const params: Record<string, boolean> = {};
      this.parametresWO.forEach(parametre => {
        params[parametre.nom ?? ''] = this.isParametreChecked(index, parametre);
      });

      return { id: null, workOrderId, date: jour.hour(12).minute(0).second(0).millisecond(0), params };
    });
  }

  /** Mode édition : recharge les lignes persistées et rallume les checkpoints correspondants. */
  private loadParametrages(workOrderId: number): void {
    this.parametrageDeplacementService.findByWorkOrder(workOrderId).subscribe({
      next: res => {
        const checks: { [key: string]: boolean } = {};

        (res.body ?? []).forEach(row => {
          if (!row.date || !row.params || typeof row.params !== 'object') {
            return;
          }
          const dateKey = dayjs(row.date).format('YYYY-MM-DD');
          Object.entries(row.params).forEach(([nom, value]) => {
            checks[`${dateKey}_${nom}`] = value === true;
          });
        });

        this.parametreChecks = checks;
      },
    });
  }

  isParametreChecked(jourIndex: number, parametre: IParametreWO): boolean {
    return this.parametreChecks[this.parametreKey(jourIndex, parametre)] === true;
  }

  toggleParametre(jourIndex: number, parametre: IParametreWO): void {
    const key = this.parametreKey(jourIndex, parametre);
    this.parametreChecks[key] = !this.parametreChecks[key];
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

  // ================================
  // Véhicules (sélection multiple, persistée via WorkOrderVehicule) — même logique que les Techniciens
  // ================================
  private loadVehicules(societeId?: number | null): void {
    if (societeId === null || societeId === undefined) {
      this.vehicules = [];
      this.loadingVehicules = false;
      return;
    }

    this.loadingVehicules = true;

    this.vehiculeService.queryBySociete(societeId).subscribe({
      next: res => {
        this.vehicules = res.body ?? [];
        this.loadingVehicules = false;
      },
      error: () => {
        this.vehicules = [];
        this.loadingVehicules = false;
      },
    });
  }

  private loadRessources(societeId?: number | null): void {
    if (societeId === null || societeId === undefined) {
      this.ressources = [];
      this.loadingRessources = false;
      return;
    }

    this.loadingRessources = true;

    this.ressourceService.queryBySociete(societeId).subscribe({
      next: res => {
        this.ressources = res.body ?? [];
        this.loadingRessources = false;
      },
      error: () => {
        this.ressources = [];
        this.loadingRessources = false;
      },
    });
  }

  onVehiculeSelectChange(vehicules: IVehicule[] | null): void {
    const nouvelleListe = vehicules ?? [];
    const ancienneListe = this.selectedVehicules;
    const ajouts = nouvelleListe.filter(v => !ancienneListe.some(a => a.id === v.id));

    this.selectedVehicules = nouvelleListe;

    if (ajouts.length === 0) {
      return;
    }

    const idsAjoutes = ajouts.map(v => v.id).filter((id): id is number => id !== null && id !== undefined);

    this.workOrderVehiculeService.checkDisponibilite(idsAjoutes, this.workOrder?.id ?? null).subscribe({
      next: res => {
        const conflicts = res.body ?? [];
        if (conflicts.length === 0) {
          return;
        }

        const idsEnConflit = conflicts.map(c => c.vehiculeId);
        this.selectedVehicules = this.selectedVehicules.filter(v => !idsEnConflit.includes(v.id!));

        const messages = conflicts.map(conflict => {
          const vehicule = ajouts.find(v => v.id === conflict.vehiculeId);
          const label = vehicule ? `${vehicule.marque} ${vehicule.type} (${vehicule.matricule})` : 'Ce véhicule';
          const dateFin = conflict.dateHeureFinPrev ? new Date(conflict.dateHeureFinPrev).toLocaleString() : '';

          return `${label} est déjà affecté au work order ${
            conflict.numFicheIntervention ?? conflict.workOrderId
          } (mission en cours jusqu'au ${dateFin}).`;
        });

        this.showVehiculeError(messages.join('\n'));
      },
    });
  }

  private showVehiculeError(message: string): void {
    this.vehiculeError = message;

    if (this.vehiculeErrorTimeoutId) {
      clearTimeout(this.vehiculeErrorTimeoutId);
    }

    this.vehiculeErrorTimeoutId = setTimeout(() => {
      this.vehiculeError = '';
      this.vehiculeErrorTimeoutId = undefined;
    }, 4000);
  }

  private loadAutresVehicules(workOrderId: number): void {
    this.workOrderVehiculeService.findByWorkOrder(workOrderId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const vehiculeIds = links.map(l => l.vehiculeId).filter((id): id is number => id !== null && id !== undefined);

        if (vehiculeIds.length === 0) {
          this.selectedVehicules = [];
          return;
        }

        forkJoin(vehiculeIds.map(id => this.vehiculeService.find(id))).subscribe({
          next: responses => {
            this.selectedVehicules = responses.map(r => r.body).filter((v): v is IVehicule => v !== null);
          },
        });
      },
      error: () => {
        this.selectedVehicules = [];
      },
    });
  }

  openVehiculeModal(): void {
    const societeId = (this.selectedAffaire as any)?.societeId ?? null;

    if (societeId === null || societeId === undefined) {
      this.showVehiculeError("Veuillez d'abord sélectionner un projet (affaire) avant de choisir un véhicule.");
      return;
    }

    const modalRef = this.modalService.open(VehiculeSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'vehicule-selector-modal-window',
    });

    modalRef.componentInstance.modalTitle = 'Sélectionner un ou plusieurs véhicules';
    modalRef.componentInstance.multiple = true;
    modalRef.componentInstance.initialSelection = this.selectedVehicules;
    modalRef.componentInstance.checkDisponibilite = true;
    modalRef.componentInstance.excludeWorkOrderId = this.workOrder?.id ?? null;
    modalRef.componentInstance.societeId = societeId;

    modalRef.result
      .then((vehicules: IVehicule[]) => {
        this.selectedVehicules = vehicules ?? [];
      })
      .catch(() => {});
  }

  // ================================
  // Ressources (sélection multiple, persistée via WorkOrderRessource) — même logique que les Véhicules
  // ================================
  onRessourceSelectChange(ressources: IRessource[] | null): void {
    const nouvelleListe = ressources ?? [];
    const ancienneListe = this.selectedRessources;
    const ajouts = nouvelleListe.filter(r => !ancienneListe.some(a => a.id === r.id));

    this.selectedRessources = nouvelleListe;

    if (ajouts.length === 0) {
      return;
    }

    const idsAjoutes = ajouts.map(r => r.id).filter((id): id is number => id !== null && id !== undefined);

    this.workOrderRessourceService.checkDisponibilite(idsAjoutes, this.workOrder?.id ?? null).subscribe({
      next: res => {
        const conflicts = res.body ?? [];
        if (conflicts.length === 0) {
          return;
        }

        const idsEnConflit = conflicts.map(c => c.ressourceId);
        this.selectedRessources = this.selectedRessources.filter(r => !idsEnConflit.includes(r.id!));

        const messages = conflicts.map(conflict => {
          const ressource = ajouts.find(r => r.id === conflict.ressourceId);
          const label = ressource?.nom ?? 'Cette ressource';
          const dateFin = conflict.dateHeureFinPrev ? new Date(conflict.dateHeureFinPrev).toLocaleString() : '';

          return `${label} est déjà affectée au work order ${
            conflict.numFicheIntervention ?? conflict.workOrderId
          } (mission en cours jusqu'au ${dateFin}).`;
        });

        this.showRessourceError(messages.join('\n'));
      },
    });
  }

  private showRessourceError(message: string): void {
    this.ressourceError = message;

    if (this.ressourceErrorTimeoutId) {
      clearTimeout(this.ressourceErrorTimeoutId);
    }

    this.ressourceErrorTimeoutId = setTimeout(() => {
      this.ressourceError = '';
      this.ressourceErrorTimeoutId = undefined;
    }, 4000);
  }

  private loadAutresRessources(workOrderId: number): void {
    this.workOrderRessourceService.findByWorkOrder(workOrderId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const ressourceIds = links.map(l => l.ressourceId).filter((id): id is number => id !== null && id !== undefined);

        if (ressourceIds.length === 0) {
          this.selectedRessources = [];
          return;
        }

        forkJoin(ressourceIds.map(id => this.ressourceService.find(id))).subscribe({
          next: responses => {
            this.selectedRessources = responses.map(r => r.body).filter((r): r is IRessource => r !== null);
          },
        });
      },
      error: () => {
        this.selectedRessources = [];
      },
    });
  }

  openRessourceModal(): void {
    const societeId = (this.selectedAffaire as any)?.societeId ?? null;

    if (societeId === null || societeId === undefined) {
      this.showRessourceError("Veuillez d'abord sélectionner un projet (affaire) avant de choisir une ressource.");
      return;
    }

    const modalRef = this.modalService.open(RessourceSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'ressource-selector-modal-window',
    });

    modalRef.componentInstance.modalTitle = 'Sélectionner une ou plusieurs ressources';
    modalRef.componentInstance.multiple = true;
    modalRef.componentInstance.initialSelection = this.selectedRessources;
    modalRef.componentInstance.checkDisponibilite = true;
    modalRef.componentInstance.excludeWorkOrderId = this.workOrder?.id ?? null;
    modalRef.componentInstance.societeId = societeId;

    modalRef.result
      .then((ressources: IRessource[]) => {
        this.selectedRessources = ressources ?? [];
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

  /**
   * Appelé lors de la sélection d'un site (lieu) dans le ng-select.
   * Un site appartient à une seule zone, et une zone à une seule ville :
   * on dérive donc automatiquement villeId/zoneId depuis le site sélectionné
   * (le SiteDTO renvoyé par le backend inclut déjà ville{id,nom} et zoneId/zoneNom).
   */
  onLieuSelectChange(site: ISite | null): void {
    this.selectedSite = site;

    this.editForm.patchValue({
      lieu: site?.designation ?? null,
      villeId: site?.ville?.id ?? null,
      zoneId: site?.zoneId ?? null,
      siteId: site?.id ?? null,
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
          this.onLieuSelectChange(site);
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

    // Compteurs issus des checkpoints par jour
    workOrder.nombreHebergements = this.nombreHebergements;
    workOrder.nombreNuits = this.nombreNuits;
    workOrder.nombreDeplacements = this.nombreDeplacements;
    // Les booléens (obligatoires côté backend) sont dérivés des compteurs
    workOrder.hebergement = this.nombreHebergements > 0;
    workOrder.missionDeNuit = this.nombreNuits > 0;

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
    const vehiculeIds = this.selectedVehicules.map(v => v.id).filter((id): id is number => id !== null && id !== undefined);
    const ressourceIds = this.selectedRessources.map(r => r.id).filter((id): id is number => id !== null && id !== undefined);

    forkJoin([
      this.workOrderTechniciensService.replaceForWorkOrder(workOrderId, contactSocieteIds),
      this.workOrderVehiculeService.replaceForWorkOrder(workOrderId, vehiculeIds),
      this.workOrderRessourceService.replaceForWorkOrder(workOrderId, ressourceIds),
      this.parametrageDeplacementService.replaceForWorkOrder(workOrderId, this.buildParametrages(workOrderId)),
    ]).subscribe({
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
      this.navigateToEditWorkOrder(workOrderId);
      return;
    }

    const uploads = this.pendingPieceJointes.map(p =>
      this.pieceJointeService.uploadPieceJointeWorkOrder(p.file, workOrderId, this.generateRandomId(10))
    );

    forkJoin(uploads).subscribe({
      next: () => {
        this.pendingPieceJointes = [];
        this.navigateToEditWorkOrder(workOrderId);
      },
      error: () => {
        alert("Certaines pièces jointes n'ont pas pu être envoyées. Vous pouvez réessayer depuis l'accordéon Pièces Jointes.");
        this.navigateToEditWorkOrder(workOrderId);
      },
    });
  }

  /**
   * Redirige vers l'interface d'édition du work order qui vient d'être enregistré
   * (création ou mise à jour), au lieu de revenir à la liste comme le faisait
   * previousState() auparavant.
   */
  private navigateToEditWorkOrder(workOrderId: number): void {
    this.router.navigate([workOrderId, 'edit'], { relativeTo: this.activatedRoute.parent });
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

    // Synchronise le stepper de statut avec le WorkOrder chargé
    this.stepperService.show(this.statutSteps, this.currentStatut);

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

            if (!affaire.identifiantUnique) {
              console.warn('[WorkOrder][edit] affaire.identifiantUnique manquant sur la réponse find(id).', affaire);
            }

            if (!this.affaireResults.some(a => a.id === affaire.id)) {
              this.affaireResults = [affaire, ...this.affaireResults];
            }

            this.cdr.detectChanges();

            this.loadClientCommandeInfo(affaire.clientCommande ?? null);

            const societeId = (affaire as any).societeId ?? null;
            this.loadVehicules(societeId);
            this.loadRessources(societeId);
          }
        },
      });
    }

    const clientId = workOrder.clientId;

    if (clientId !== null && clientId !== undefined) {
      this.loadClientInfo(Number(clientId));
    }

    // OT externe (et Motif associé)
    const otExterneId = workOrder.otExterneId;

    if (otExterneId !== null && otExterneId !== undefined) {
      this.loadOtExterneLabel(Number(otExterneId));
    }

    // Bon de commande : la valeur persistée sur le work order prime sur celle de l'OT externe
    const bonCommandeId = workOrder.bonCommandeId;

    if (bonCommandeId !== null && bonCommandeId !== undefined) {
      this.loadBonCommandeLabel(Number(bonCommandeId));
    } else if (otExterneId !== null && otExterneId !== undefined) {
      // Anciens work orders sans bonCommandeId : repli sur le bon de commande de l'OT externe
      this.loadBonCommandeByOtExterne(Number(otExterneId));
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

    // Techniciens / Véhicules / Ressources
    if (workOrder.id !== null && workOrder.id !== undefined) {
      this.loadAutresTechniciens(workOrder.id);
      this.loadAutresVehicules(workOrder.id);
      this.loadAutresRessources(workOrder.id);
      this.loadParametrages(workOrder.id);
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
