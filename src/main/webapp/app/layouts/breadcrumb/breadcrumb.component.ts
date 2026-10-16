import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'jhi-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  /**
   * Champs testés dans l'ordre pour trouver le libellé de l'entité.
   * Le premier champ renseigné (chaîne non vide) est utilisé.
   */
  private static readonly LABEL_FIELDS = [
    'identifiantUnique',
    'reference',
    'designation',
    'raisonSociale',
    'nom',
    'matricule',
    'numFacture',
  ];

  breadcrumbs: Breadcrumb[] = [];
  hideCurrentCrumb = false;
  private routerSubscription?: Subscription;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.hideCurrentCrumb = false;
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);

    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.hideCurrentCrumb = false;
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    });
  }
  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private buildBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = [], depth = 0): Breadcrumb[] {
    for (const child of route.children) {
      const routeUrl = child.snapshot.url.map(segment => segment.path).join('/');
      const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;
      const pageTitleKey = child.snapshot.data?.['pageTitle'];

      const isTransientPage = routeUrl === 'new' || routeUrl.endsWith('/edit') || routeUrl.endsWith('/view');

      if (routeUrl && isTransientPage) {
        // Page "Détail" / "Modifier" : on affiche le libellé de l'entité chargée
        // par le resolver (identifiantUnique > reference > designation > raisonSociale > nom).
        const entityLabel = this.extractEntityLabel(child.snapshot.data);
        if (entityLabel) {
          breadcrumbs.push({ label: entityLabel, url: nextUrl });
          // La miette de l'entité devient la dernière : en gras et non cliquable.
          this.hideCurrentCrumb = false;
        } else {
          // Page "Nouveau" (ou entité sans identifiantUnique) : pas de miette dédiée,
          // la miette précédente redevient donc la dernière et doit rester cliquable.
          this.hideCurrentCrumb = true;
        }
      } else if (routeUrl) {
        // Cette route consomme un vrai segment d'URL (ex: 'agence') -> elle mérite sa propre miette
        const label = pageTitleKey ? this.translateService.instant(pageTitleKey) : routeUrl;
        breadcrumbs.push({ label: this.cleanLabel(label), url: nextUrl });
      } else if (pageTitleKey && depth > 0 && !breadcrumbs.length) {
        // Route "vide" MAIS imbriquée sous un vrai segment (ex: 'ressources/agences') -> section réelle, on l'affiche
        // depth > 0 exclut explicitement la route racine (l'accueil), qui est déjà représentée par le lien "Accueil"
        const label = this.translateService.instant(pageTitleKey);
        breadcrumbs.push({ label: this.cleanLabel(label), url: nextUrl });
      }

      this.buildBreadcrumbs(child, nextUrl, breadcrumbs, depth + 1);
    }
    return breadcrumbs;
  }

  /**
   * Cherche dans les données de la route l'entité chargée par le resolver
   * (ex: data['affaire'], data['otExterne']) et retourne son libellé :
   * identifiantUnique, sinon reference, sinon designation, sinon raisonSociale, sinon nom.
   */
  private extractEntityLabel(data: Data | undefined): string | null {
    if (!data) {
      return null;
    }
    for (const value of Object.values(data)) {
      if (value && typeof value === 'object') {
        const entity = value as Record<string, unknown>;
        for (const field of BreadcrumbComponent.LABEL_FIELDS) {
          const candidate = entity[field];
          if (typeof candidate === 'string' && candidate.trim()) {
            return candidate;
          }
        }
      }
    }
    return null;
  }

  private cleanLabel(raw: string): string {
    // Retire tous les '/' parasites (fallback de traduction manquante, path mal formé, etc.)
    // et capitalise proprement le résultat.
    const cleaned = raw.split('/').filter(Boolean).pop();
    if (!cleaned) {
      return raw;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}
