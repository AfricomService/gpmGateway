import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';

import { IOtExterne } from '../ot-externe.model';
import { StatutOtExterne } from 'app/entities/enumerations/statut-ot-externe.model';

import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';
import { IBonCommande } from 'app/entities/financeService/bon-commande/bon-commande.model';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { OtExterneAutreResponsableService } from '../service/ot-externe-autre-responsable.service';
import { IPieceJointe } from 'app/entities/projectService/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/projectService/piece-jointe/service/piece-jointe.service';

import { ModelPhaseOTService } from '../../model-phase-ot/service/model-phase-ot.service';
import { IModelPhaseOT } from '../../model-phase-ot/model-phase-ot.model';
import { IPhaseOt } from '../../phase-ot/phase-ot.model';
import { IArticle } from '../../../projectService/article/article.model';
import { IOtArticles } from '../ot-articles.model';
import { OtArticlesService } from '../ot-articles.service';
import { ArticleService } from '../../../projectService/article/service/article.service';

type AccordionPanel = 'global' | 'mode' | 'modele' | 'client' | 'piecesJointes';

@Component({
  selector: 'jhi-ot-externe-detail',
  templateUrl: './ot-externe-detail.component.html',
  styleUrls: ['../update/ot-externe-update.component.scss'],
})
export class OtExterneDetailComponent implements OnInit {
  otExterne: IOtExterne | null = null;
  statutOtExterneValues = Object.keys(StatutOtExterne);

  // ================================
  // Accordéon (état purement visuel — même pattern que ot-externe-update)
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global', 'mode', 'modele', 'client', 'piecesJointes']);

  // ================================
  // Affaire
  // ================================
  selectedAffaire: IAffaire | null = null;
  selectedAffaireCode: string | null = null;
  loadingAffaire = false;

  // ================================
  // Information Client
  // ================================
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  selectedClientCommandeInfo: IClient | null = null;
  loadingClientCommandeInfo = false;

  // ================================
  // Responsable / Autre Responsable
  // ================================
  selectedResponsable: IContactSociete | null = null;
  loadingResponsable = false;

  selectedAutresResponsables: IContactSociete[] = [];
  loadingAutresResponsables = false;

  // ================================
  // Bon de commande
  // ================================
  selectedBonCommande: IBonCommande | null = null;

  // ================================
  // Modèle OT et phases
  // ================================
  selectedModeleOt: IModelPhaseOT | null = null;
  loadingModeleOt = false;

  selectedModelePhases: IPhaseOt[] = [];
  loadingModelePhases = false;

  // ================================
  // Articles associés aux phases
  // ================================
  allArticles: IArticle[] = [];
  loadingArticles = false;

  otArticlesByPhase: { [phaseOtId: number]: IOtArticles[] } = {};
  loadingOtArticles = false;

  // ================================
  // Pièces Jointes
  // ================================
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;

  selectedPjForPreview: IPieceJointe | null = null;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected bonCommandeService: BonCommandeService,
    protected otExterneAutreResponsableService: OtExterneAutreResponsableService,
    protected pieceJointeService: PieceJointeService,
    protected sanitizer: DomSanitizer,
    protected modelPhaseOTService: ModelPhaseOTService,
    protected otArticlesService: OtArticlesService,
    protected articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.loadAllArticles();

    this.activatedRoute.data.subscribe(({ otExterne }) => {
      this.otExterne = otExterne;
      if (otExterne) {
        this.loadDetails(otExterne);
      }
    });
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

  previousState(): void {
    window.history.back();
  }

  // ================================
  // Chargement de toutes les infos liées (identique à updateForm côté update,
  // mais sans aucune logique de formulaire / édition)
  // ================================
  private loadDetails(otExterne: IOtExterne): void {
    const affaireId = (otExterne as any).affaireId;
    if (affaireId !== null && affaireId !== undefined) {
      this.loadAffaire(affaireId);
    }

    const clientId = (otExterne as any).clientId;
    if (clientId !== null && clientId !== undefined) {
      this.loadClientInfo(Number(clientId));
    }

    const responsableId = otExterne.responsableId;
    if (responsableId !== null && responsableId !== undefined && responsableId !== '') {
      this.loadResponsableLabel(Number(responsableId));
    }

    const bonCommandeId = otExterne.bonCommandeId;
    if (bonCommandeId !== null && bonCommandeId !== undefined) {
      this.bonCommandeService.find(bonCommandeId).subscribe({
        next: res => {
          this.selectedBonCommande = res.body ?? null;
        },
      });
    }

    if (otExterne.id !== null && otExterne.id !== undefined) {
      this.loadAutresResponsables(otExterne.id);
      this.loadPieceJointes(otExterne.id);
      this.loadOtArticles(otExterne.id);
    }

    if (otExterne.modeleOtId !== null && otExterne.modeleOtId !== undefined) {
      this.loadModeleOt(otExterne.modeleOtId);
      this.loadModelePhases(otExterne.modeleOtId);
    }
  }

  getAutresResponsablesNames(): string {
    return this.selectedAutresResponsables.map(r => r.nomPrenom).join(', ');
  }

  // ================================
  // Affaire
  // ================================
  private loadAffaire(affaireId: number): void {
    this.loadingAffaire = true;

    this.affaireService.find(affaireId).subscribe({
      next: res => {
        const affaire = res.body;
        this.selectedAffaire = affaire ?? null;
        this.selectedAffaireCode = affaire?.identifiantUnique ?? null;
        this.loadingAffaire = false;

        if (affaire?.clientCommande !== null && affaire?.clientCommande !== undefined) {
          this.loadClientCommandeInfo(affaire.clientCommande);
        }
      },
      error: () => {
        this.selectedAffaire = null;
        this.selectedAffaireCode = null;
        this.loadingAffaire = false;
      },
    });
  }

  // ================================
  // Information Client
  // ================================
  private loadClientInfo(clientId: number): void {
    this.loadingClientInfo = true;

    this.clientService.find(clientId).subscribe({
      next: res => {
        this.selectedClientInfo = res.body ?? null;
        this.loadingClientInfo = false;
      },
      error: () => {
        this.selectedClientInfo = null;
        this.loadingClientInfo = false;
      },
    });
  }

  private loadClientCommandeInfo(clientCommandeId: number): void {
    this.loadingClientCommandeInfo = true;

    this.clientService.find(clientCommandeId).subscribe({
      next: res => {
        this.selectedClientCommandeInfo = res.body ?? null;
        this.loadingClientCommandeInfo = false;
      },
      error: () => {
        this.selectedClientCommandeInfo = null;
        this.loadingClientCommandeInfo = false;
      },
    });
  }

  // ================================
  // Responsable / Autres Responsables
  // ================================
  private loadResponsableLabel(responsableId: number): void {
    this.loadingResponsable = true;

    this.bonCommandeService.findResponsableById(responsableId).subscribe({
      next: res => {
        this.selectedResponsable = res.body ?? null;
        this.loadingResponsable = false;
      },
      error: () => {
        this.selectedResponsable = null;
        this.loadingResponsable = false;
      },
    });
  }

  private loadAutresResponsables(otExterneId: number): void {
    this.loadingAutresResponsables = true;

    this.otExterneAutreResponsableService.findByOtExterne(otExterneId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const contactIds = links.map(l => l.contactSocieteId).filter((id): id is number => id !== null && id !== undefined);

        if (contactIds.length === 0) {
          this.selectedAutresResponsables = [];
          this.loadingAutresResponsables = false;
          return;
        }

        forkJoin(contactIds.map(id => this.bonCommandeService.findResponsableById(id))).subscribe({
          next: responses => {
            this.selectedAutresResponsables = responses.map(r => r.body).filter((c): c is IContactSociete => c !== null);
            this.loadingAutresResponsables = false;
          },
          error: () => {
            this.selectedAutresResponsables = [];
            this.loadingAutresResponsables = false;
          },
        });
      },
      error: () => {
        this.selectedAutresResponsables = [];
        this.loadingAutresResponsables = false;
      },
    });
  }

  // ================================
  // Modèle OT et phases
  // ================================
  private loadModeleOt(modeleOtId: number): void {
    this.loadingModeleOt = true;

    this.modelPhaseOTService.find(modeleOtId).subscribe({
      next: res => {
        this.selectedModeleOt = res.body ?? null;
        this.loadingModeleOt = false;
      },
      error: () => {
        this.selectedModeleOt = null;
        this.loadingModeleOt = false;
      },
    });
  }

  private loadModelePhases(modeleOtId: number): void {
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

  // ================================
  // Articles associés aux phases
  // ================================
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

  getArticleById(articleId: number | null | undefined): IArticle | null {
    if (articleId === null || articleId === undefined) {
      return null;
    }
    return this.allArticles.find(a => a.id === articleId) ?? null;
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

  // ================================
  // Pièces Jointes — chargement + aperçu/téléchargement uniquement (lecture)
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
}
