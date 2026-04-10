## Plan: Client Update Interface Alignment

Implement the `affaire-update` UI style in `client-update` to modernize relationships management. `Contacts` and `Sites` will feature inline creation modals natively for seamless data entry. `Affaires` and `Factures` will adopt a read-only card layout with a placeholder for future unlinking logic, and their "Gérer" buttons will route to respective creation pages pre-filled via query parameters.

### Steps

1. Inject `NgbModal` in `client-update.component.ts` and initialize generic objects for `newContact` and `newSite`. Ensure placeholder methods exist for unlinking items from the arrays.
2. Replace the `Contacts` table in `client-update.component.html` with a card grid (`*ngFor="let contact of selectedContacts"`). Add a modal (`#contactModal`) triggered by a "Gérer" button to create new contacts. Include a placeholder "unlink" button on each card.
3. Replace the `Sites` table in `client-update.component.html` with a card grid for `selectedSites`. Add a "Gérer" button opening an inline modal (`#siteModal`) to capture and push site data. Include a placeholder "unlink" button on each card.
4. Transform the `Affaires` section in `client-update.component.html` to the card layout showing `selectedAffaires`. Implement a "Gérer" button using `[routerLink]="['/affaire/new']"` and `[queryParams]="{ clientId: client?.id }"`. Retain an unlink action button explicitly marked as a placeholder.
5. Transform the `Factures` section in `client-update.component.html` to the card layout showing `selectedFactures`. Add a "Gérer" button routing to `['/facture/new']` with `[queryParams]="{ clientId: client?.id }"`. Retain an unlink action button explicitly marked as a placeholder.
6. Update `affaire-update.component.ts` and `facture-update.component.ts` to intercept `ActivatedRoute.queryParams`. If `clientId` is present during initialization, patch the component's forms to pre-select the referenced client.
