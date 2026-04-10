import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'ressources',
        loadChildren: () => import('app/ressources/ressources.module').then(m => m.RessourcesModule),
      },
      {
        path: 'activite',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceActivite.home.title' },
        loadChildren: () => import('./operationsService/activite/activite.module').then(m => m.OperationsServiceActiviteModule),
      },
      {
        path: 'affaire',
        data: { pageTitle: 'gpmGatewayApp.projectServiceAffaire.home.title' },
        loadChildren: () => import('./projectService/affaire/affaire.module').then(m => m.ProjectServiceAffaireModule),
      },
      {
        path: 'affaire-article',
        data: { pageTitle: 'gpmGatewayApp.projectServiceAffaireArticle.home.title' },
        loadChildren: () =>
          import('./projectService/affaire-article/affaire-article.module').then(m => m.ProjectServiceAffaireArticleModule),
      },
      {
        path: 'agence',
        pathMatch: 'full',
        redirectTo: 'ressources/agences',
      },
      {
        path: 'agence',
        data: { pageTitle: 'gpmGatewayApp.projectServiceAgence.home.title' },
        loadChildren: () => import('./projectService/agence/agence.module').then(m => m.ProjectServiceAgenceModule),
      },
      {
        path: 'article',
        pathMatch: 'full',
        redirectTo: 'ressources/articles',
      },
      {
        path: 'article',
        data: { pageTitle: 'gpmGatewayApp.projectServiceArticle.home.title' },
        loadChildren: () => import('./projectService/article/article.module').then(m => m.ProjectServiceArticleModule),
      },
      {
        path: 'article-demande-achat',
        data: { pageTitle: 'gpmGatewayApp.financeServiceArticleDemandeAchat.home.title' },
        loadChildren: () =>
          import('./financeService/article-demande-achat/article-demande-achat.module').then(
            m => m.FinanceServiceArticleDemandeAchatModule
          ),
      },
      {
        path: 'article-mission',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceArticleMission.home.title' },
        loadChildren: () =>
          import('./operationsService/article-mission/article-mission.module').then(m => m.OperationsServiceArticleMissionModule),
      },
      {
        path: 'client',
        data: { pageTitle: 'gpmGatewayApp.projectServiceClient.home.title' },
        loadChildren: () => import('./projectService/client/client.module').then(m => m.ProjectServiceClientModule),
      },
      {
        path: 'contact',
        data: { pageTitle: 'gpmGatewayApp.projectServiceContact.home.title' },
        loadChildren: () => import('./projectService/contact/contact.module').then(m => m.ProjectServiceContactModule),
      },
      {
        path: 'demande-achat',
        data: { pageTitle: 'gpmGatewayApp.financeServiceDemandeAchat.home.title' },
        loadChildren: () => import('./financeService/demande-achat/demande-achat.module').then(m => m.FinanceServiceDemandeAchatModule),
      },
      {
        path: 'demande-espece',
        data: { pageTitle: 'gpmGatewayApp.financeServiceDemandeEspece.home.title' },
        loadChildren: () => import('./financeService/demande-espece/demande-espece.module').then(m => m.FinanceServiceDemandeEspeceModule),
      },
      {
        path: 'depense-diverse',
        data: { pageTitle: 'gpmGatewayApp.financeServiceDepenseDiverse.home.title' },
        loadChildren: () =>
          import('./financeService/depense-diverse/depense-diverse.module').then(m => m.FinanceServiceDepenseDiverseModule),
      },
      {
        path: 'devis',
        data: { pageTitle: 'gpmGatewayApp.financeServiceDevis.home.title' },
        loadChildren: () => import('./financeService/devis/devis.module').then(m => m.FinanceServiceDevisModule),
      },
      {
        path: 'facture',
        data: { pageTitle: 'gpmGatewayApp.financeServiceFacture.home.title' },
        loadChildren: () => import('./financeService/facture/facture.module').then(m => m.FinanceServiceFactureModule),
      },
      {
        path: 'facture-wo',
        data: { pageTitle: 'gpmGatewayApp.financeServiceFactureWo.home.title' },
        loadChildren: () => import('./financeService/facture-wo/facture-wo.module').then(m => m.FinanceServiceFactureWOModule),
      },
      {
        path: 'frais-de-mission',
        data: { pageTitle: 'gpmGatewayApp.financeServiceFraisDeMission.home.title' },
        loadChildren: () =>
          import('./financeService/frais-de-mission/frais-de-mission.module').then(m => m.FinanceServiceFraisDeMissionModule),
      },
      {
        path: 'historique-statut-wo',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceHistoriqueStatutWo.home.title' },
        loadChildren: () =>
          import('./operationsService/historique-statut-wo/historique-statut-wo.module').then(
            m => m.OperationsServiceHistoriqueStatutWOModule
          ),
      },
      {
        path: 'jour-ferie',
        data: { pageTitle: 'gpmGatewayApp.projectServiceJourFerie.home.title' },
        loadChildren: () => import('./projectService/jour-ferie/jour-ferie.module').then(m => m.ProjectServiceJourFerieModule),
      },
      {
        path: 'matrice-facturation',
        data: { pageTitle: 'gpmGatewayApp.projectServiceMatriceFacturation.home.title' },
        loadChildren: () =>
          import('./projectService/matrice-facturation/matrice-facturation.module').then(m => m.ProjectServiceMatriceFacturationModule),
      },
      {
        path: 'matrice-jour-ferie',
        data: { pageTitle: 'gpmGatewayApp.projectServiceMatriceJourFerie.home.title' },
        loadChildren: () =>
          import('./projectService/matrice-jour-ferie/matrice-jour-ferie.module').then(m => m.ProjectServiceMatriceJourFerieModule),
      },
      {
        path: 'motif',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceMotif.home.title' },
        loadChildren: () => import('./operationsService/motif/motif.module').then(m => m.OperationsServiceMotifModule),
      },
      {
        path: 'ot-externe',
        data: { pageTitle: 'gpmGatewayApp.financeServiceOtExterne.home.title' },
        loadChildren: () => import('./financeService/ot-externe/ot-externe.module').then(m => m.FinanceServiceOtExterneModule),
      },
      {
        path: 'piece-jointe',
        data: { pageTitle: 'gpmGatewayApp.projectServicePieceJointe.home.title' },
        loadChildren: () => import('./projectService/piece-jointe/piece-jointe.module').then(m => m.ProjectServicePieceJointeModule),
      },
      {
        path: 'site',
        pathMatch: 'full',
        redirectTo: 'ressources/sites',
      },
      {
        path: 'site',
        data: { pageTitle: 'gpmGatewayApp.projectServiceSite.home.title' },
        loadChildren: () => import('./projectService/site/site.module').then(m => m.ProjectServiceSiteModule),
      },
      {
        path: 'societe',
        data: { pageTitle: 'gpmGatewayApp.projectServiceSociete.home.title' },
        loadChildren: () => import('./projectService/societe/societe.module').then(m => m.ProjectServiceSocieteModule),
      },
      {
        path: 'sst',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceSSt.home.title' },
        loadChildren: () => import('./operationsService/sst/sst.module').then(m => m.OperationsServiceSSTModule),
      },
      {
        path: 'tache',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceTache.home.title' },
        loadChildren: () => import('./operationsService/tache/tache.module').then(m => m.OperationsServiceTacheModule),
      },
      {
        path: 'vehicule',
        pathMatch: 'full',
        redirectTo: 'ressources/vehicules',
      },
      {
        path: 'vehicule',
        data: { pageTitle: 'gpmGatewayApp.projectServiceVehicule.home.title' },
        loadChildren: () => import('./projectService/vehicule/vehicule.module').then(m => m.ProjectServiceVehiculeModule),
      },
      {
        path: 'ville',
        data: { pageTitle: 'gpmGatewayApp.projectServiceVille.home.title' },
        loadChildren: () => import('./projectService/ville/ville.module').then(m => m.ProjectServiceVilleModule),
      },
      {
        path: 'wo-motif',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceWoMotif.home.title' },
        loadChildren: () => import('./operationsService/wo-motif/wo-motif.module').then(m => m.OperationsServiceWoMotifModule),
      },
      {
        path: 'work-order',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceWorkOrder.home.title' },
        loadChildren: () => import('./operationsService/work-order/work-order.module').then(m => m.OperationsServiceWorkOrderModule),
      },
      {
        path: 'wo-site',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceWoSite.home.title' },
        loadChildren: () => import('./operationsService/wo-site/wo-site.module').then(m => m.OperationsServiceWoSiteModule),
      },
      {
        path: 'wo-utilisateur',
        data: { pageTitle: 'gpmGatewayApp.operationsServiceWoUtilisateur.home.title' },
        loadChildren: () =>
          import('./operationsService/wo-utilisateur/wo-utilisateur.module').then(m => m.OperationsServiceWoUtilisateurModule),
      },
      {
        path: 'zone',
        pathMatch: 'full',
        redirectTo: 'ressources/zones',
      },
      {
        path: 'zone',
        data: { pageTitle: 'gpmGatewayApp.projectServiceZone.home.title' },
        loadChildren: () => import('./projectService/zone/zone.module').then(m => m.ProjectServiceZoneModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
