import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
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
  breadcrumbs: Breadcrumb[] = [];
  hideCurrentCrumb = false;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private location: Location
  ) {}

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

  goBack(): void {
    this.location.back();
  }

  private buildBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = [], depth = 0): Breadcrumb[] {
    for (const child of route.children) {
      const routeUrl = child.snapshot.url.map(segment => segment.path).join('/');
      const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;
      const pageTitleKey = child.snapshot.data?.['pageTitle'];

      const isTransientPage = routeUrl === 'new' || routeUrl.endsWith('/edit') || routeUrl.endsWith('/view');

      if (routeUrl && isTransientPage) {
        // Page "Nouveau" / "Modifier" / "Détail" : pas de miette dédiée,
        // la miette précédente redevient donc la dernière et doit rester cliquable.
        this.hideCurrentCrumb = true;
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
