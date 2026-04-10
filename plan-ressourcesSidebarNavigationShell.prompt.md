## Plan: Ressources Sidebar Navigation Shell

Move navigation fully to `/ressources/*` with a dedicated shell route and sidebar that initially covers only list pages. Reuse existing entity modules through nested lazy routes, keep current French labels hardcoded, and add explicit redirects from legacy URLs to preserve access during migration while establishing the new canonical route structure.

### Steps

1. Define the canonical shell entry in [`src/main/webapp/app/entities/entity-routing.module.ts`](src/main/webapp/app/entities/entity-routing.module.ts) with `path: 'ressources'` and default redirect to `vehicules`.
2. Add `RessourcesShellComponent` (`sidebar + router-outlet`) under [`src/main/webapp/app/layouts/`](src/main/webapp/app/layouts/) as the parent layout for ressources navigation.
3. Register nested lazy child routes for list views only (`vehicules`, `articles`, `agences`, `sites`, `zones`) by reusing existing feature modules.
4. Update [`src/main/webapp/app/layouts/navbar/navbar.component.html`](src/main/webapp/app/layouts/navbar/navbar.component.html) so “Ressources” points to the canonical `/ressources/vehicules` entry.
5. Implement legacy-to-canonical redirects in [`src/main/webapp/app/entities/entity-routing.module.ts`](src/main/webapp/app/entities/entity-routing.module.ts) from `/vehicule`, `/article`, `/agence`, `/site`, `/zone` to `/ressources/*`.
6. Apply shell styling in the new layout SCSS and minimal shared tweaks in [`src/main/webapp/content/scss/global.scss`](src/main/webapp/content/scss/global.scss) for active state and responsive sidebar behavior.

### Decisions and Immediate Implications

1. URL policy is finalized to Option B: full migration to `/ressources/*`; all old top-level entity URLs become redirect-only and are no longer canonical.
2. Sidebar scope is finalized to list pages only; detail/edit/create routes remain outside the shell for this iteration and are not added to sidebar routing.
3. Labeling/i18n is finalized to hardcoded French labels; no new `jhiTranslate` keys are introduced in this pass, reducing immediate refactor scope.
