import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { IBonCommande } from '../bon-commande.model';
import { BonCommandeService } from '../service/bon-commande.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { BonCommandeAutreResponsableService } from '../service/bon-commande-autre-responsable.service';
import { IBonCommandeArticles } from '../bon-commande-articles.model';
import { BonCommandeArticlesService } from '../service/bon-commande-articles.service';
import { IArticle } from 'app/entities/projectService/article/article.model';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';
import { IPieceJointe } from 'app/entities/projectService/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/projectService/piece-jointe/service/piece-jointe.service';
import { saveAs } from 'file-saver';

type AccordionPanel = 'global' | 'client' | 'detailsCommande' | 'otAssocies' | 'articlesMissions' | 'piecesJointes';

/** Article affiché en lecture seule dans l'accordéon "Détails Commande". */
interface ArticleDisplay {
  article: IArticle;
  qteCommande: number | null;
  qteEffectuee: number | null;
}

@Component({
  selector: 'jhi-bon-commande-detail',
  templateUrl: './bon-commande-detail.component.html',
  styleUrls: ['./bon-commande-detail.component.scss'],
})
export class BonCommandeDetailComponent implements OnInit {
  bonCommande: IBonCommande | null = null;

  // ================================
  // Accordéon
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global']);

  // ================================
  // Projet (Affaire)
  // ================================
  selectedAffaire: IAffaire | null = null;
  selectedAffaireCode: string | null = null; // Code projet (identifiantUnique)

  // ================================
  // Client Final / Client Demandeur
  // ================================
  selectedClientInfo: IClient | null = null;
  loadingClientInfo = false;

  selectedClientCommandeInfo: IClient | null = null;
  loadingClientCommandeInfo = false;

  // ================================
  // Responsable / Autres Responsables
  // ================================
  selectedResponsable: IContactSociete | null = null;
  selectedAutresResponsables: IContactSociete[] = [];

  // ================================
  // Articles du Bon de Commande
  // ================================
  chosenArticles: ArticleDisplay[] = [];
  loadingArticles = false;

  // ================================
  // Pièces Jointes
  // ================================
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  selectedPjForPreview: IPieceJointe | null = null;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected bonCommandeService: BonCommandeService,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected bonCommandeAutreResponsableService: BonCommandeAutreResponsableService,
    protected bonCommandeArticlesService: BonCommandeArticlesService,
    protected articleService: ArticleService,
    protected pieceJointeService: PieceJointeService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ bonCommande }) => {
      this.bonCommande = bonCommande;

      if (bonCommande) {
        this.loadRelatedData(bonCommande);
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

  // ================================
  // Navigation
  // ================================
  previousState(): void {
    window.history.back();
  }

  // ================================
  // Chargement des données liées (lecture seule)
  // ================================
  private loadRelatedData(bonCommande: IBonCommande): void {
    if (bonCommande.clientId !== null && bonCommande.clientId !== undefined) {
      this.loadClientInfo(Number(bonCommande.clientId));
    }

    if (bonCommande.affaireId !== null && bonCommande.affaireId !== undefined) {
      this.affaireService.find(bonCommande.affaireId).subscribe({
        next: res => {
          const affaire = res.body;

          if (affaire) {
            this.selectedAffaire = affaire;
            this.selectedAffaireCode = affaire.identifiantUnique ?? null;
            this.loadClientCommandeInfo(affaire.clientCommande ?? null);
          }
        },
      });
    }

    const responsableId = bonCommande.responsableId;
    if (responsableId !== null && responsableId !== undefined && responsableId !== '') {
      this.bonCommandeService.findResponsableById(Number(responsableId)).subscribe({
        next: res => {
          this.selectedResponsable = res.body ?? null;
        },
      });
    }

    if (bonCommande.id !== null && bonCommande.id !== undefined) {
      this.loadAutresResponsables(bonCommande.id);
      this.loadBonCommandeArticles(bonCommande.id);
      this.loadPieceJointes(bonCommande.id);
    }
  }

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

  private loadClientCommandeInfo(clientCommandeId: number | null): void {
    if (clientCommandeId === null || clientCommandeId === undefined) {
      return;
    }

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
   * Charge les articles affectés à ce bon de commande, avec les prix figés
   * (prixArticle / prixArticleHT) tels qu'enregistrés au moment de la sélection.
   */
  private loadBonCommandeArticles(bonCommandeId: number): void {
    this.loadingArticles = true;

    this.bonCommandeArticlesService.findByBonCommande(bonCommandeId).subscribe({
      next: res => {
        const links = res.body ?? [];
        const validLinks = links.filter(
          (l): l is IBonCommandeArticles & { articleId: number } => l.articleId !== null && l.articleId !== undefined
        );

        if (validLinks.length === 0) {
          this.chosenArticles = [];
          this.loadingArticles = false;
          return;
        }

        forkJoin(validLinks.map(l => this.articleService.find(l.articleId))).subscribe({
          next: responses => {
            const mapped: (ArticleDisplay | null)[] = responses.map((res2, index) => {
              const article = res2.body;

              if (!article) {
                return null;
              }

              const persistedPrix = validLinks[index].prixArticle;
              const persistedPrixHT = validLinks[index].prixArticleHT;

              // Le Prix Achat et le Prix HT affichés doivent rester ceux figés lors
              // de l'enregistrement du bon de commande, et non le prix courant de
              // l'article (qui peut avoir changé depuis).
              if (persistedPrix !== null && persistedPrix !== undefined) {
                article.prixAchat = persistedPrix;
              }
              if (persistedPrixHT !== null && persistedPrixHT !== undefined) {
                article.prixUnitHT = persistedPrixHT;
              }

              return {
                article,
                qteCommande: validLinks[index].qteCommande ?? null,
                qteEffectuee: validLinks[index].qteEffectuee ?? null,
              };
            });

            this.chosenArticles = mapped.filter((sel): sel is ArticleDisplay => sel !== null);
            this.loadingArticles = false;
          },
          error: () => {
            this.chosenArticles = [];
            this.loadingArticles = false;
          },
        });
      },
      error: () => {
        this.chosenArticles = [];
        this.loadingArticles = false;
      },
    });
  }

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

  // ================================
  // Pièces Jointes — consultation uniquement
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
}
