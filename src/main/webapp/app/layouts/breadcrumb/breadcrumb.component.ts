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
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);

    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
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

      if (routeUrl) {
        // Cette route consomme un vrai segment d'URL (ex: 'agence', 'new', ':id/edit') -> elle mérite sa propre miette
        let label = pageTitleKey ? this.translateService.instant(pageTitleKey) : routeUrl;

        if (routeUrl === 'new') {
          label = 'Nouveau';
        } else if (routeUrl.endsWith('/edit')) {
          label = 'Modifier';
        } else if (routeUrl.endsWith('/view')) {
          label = 'Détail';
        }

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
