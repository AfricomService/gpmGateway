import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClient } from '../client.model';
import { ClientService } from '../service/client.service';
import { ISite } from 'app/entities/projectService/site/site.model';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { IFacture } from 'app/entities/financeService/facture/facture.model';

@Component({
  selector: 'jhi-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  client: IClient | null = null;
  contacts: any[] = [];
  sites: ISite[] = [];
  affaires: IAffaire[] = [];
  factures: IFacture[] = [];

  constructor(protected activatedRoute: ActivatedRoute, protected clientService: ClientService) {}

  previousState(): void {
    window.history.back();
  }

  openInNewWindow(entity: string, id: number): void {
    window.open(`/${entity}/${id}/view`, '_blank');
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ client }) => {
      this.client = client;
      if (client?.id) {
        this.clientService.getContactsByClientId(client.id).subscribe(res => {
          this.contacts = res.body ?? [];
        });
        this.clientService.getSitesByClientId(client.id).subscribe(res => {
          this.sites = res.body ?? [];
        });
        this.clientService.getAffairesByClientId(client.id).subscribe(res => {
          this.affaires = res.body ?? [];
        });
        this.clientService.getFacturesByClientId(client.id).subscribe(res => {
          this.factures = res.body ?? [];
        });
      }
    });
    // 👥 CONTACTS
    // Fake data replaced by API call

    // 📍 SITES
    // Fake data replaced by API call

    // 💼 AFFAIRES
    // Fake data replaced by API call

    // 🧾 FACTURES
    // Fake data replaced by API call
  }
}
