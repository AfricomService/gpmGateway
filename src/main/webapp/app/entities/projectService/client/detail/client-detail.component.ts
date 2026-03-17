import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClient } from '../client.model';

@Component({
  selector: 'jhi-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  client: IClient | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  previousState(): void {
    window.history.back();
  }

  contacts: any[] = [];
  sites: any[] = [];
  affaires: any[] = [];
  factures: any[] = [];

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ client }) => {
      this.client = client;
    });
    // 👥 CONTACTS
    this.contacts = [
      {
        nom: 'Ben Salah Nizar',
        telephone: '+216 98 200 100',
        email: 'nizar.bensalah@tunisietelecom.tn',
        adresse: 'Rue de Russie, Tunis',
      },
      {
        nom: 'Hamdi Sonia',
        telephone: '+216 97 300 200',
        email: 'sonia.hamdi@tunisietelecom.tn',
        adresse: 'Rue de Russie, Tunis',
      },
      {
        nom: 'Ben Fredj Tarek',
        telephone: '+216 98 112 233',
        email: 'tarek.benfredj@tunisietelecom.tn',
        adresse: 'Rue de Russie, Tunis',
      },
    ];

    // 📍 SITES
    this.sites = [
      {
        code: 'SITE-TUN-001',
        designation: 'Central Télécom Bab Bhar',
        ville: 'Tunis',
        lat: 36.7992,
        lon: 10.1802,
      },
      {
        code: 'SITE-TUN-002',
        designation: 'Station Relais El Menzah',
        ville: 'Tunis',
        lat: 36.8325,
        lon: 10.1548,
      },
      {
        code: 'SITE-SFX-002',
        designation: 'Central Fibre Optique Sfax',
        ville: 'Sfax',
        lat: 34.75,
        lon: 10.77,
      },
      {
        code: 'SITE-NAB-001',
        designation: 'Station FO Nabeul',
        ville: 'Nabeul',
        lat: 36.4561,
        lon: 10.7376,
      },
      {
        code: 'SITE-KAI-001',
        designation: 'Armoire FO Kairouan',
        ville: 'Kairouan',
        lat: 35.6712,
        lon: 10.1005,
      },
    ];

    // 💼 AFFAIRES
    this.affaires = [
      {
        id: 1001,
        designation: 'Déploiement FTTH Grand Tunis - Phase 1',
        statut: 'Exécution des Travaux',
        montant: 850000,
      },
      {
        id: 1007,
        designation: 'Déploiement FTTH Grand Tunis - Phase 2',
        statut: 'Exécution des Travaux',
        montant: 1200000,
      },
    ];

    // 🧾 FACTURES
    this.factures = [
      {
        numero: 'FAC-2025-001',
        montant: 45000,
        date: '15/07/2025',
        statut: 'Fin',
      },
      {
        numero: 'FAC-2026-001',
        montant: 55000,
        date: '10/01/2026',
        statut: 'Vérification',
      },
      {
        numero: 'FAC-2026-003',
        montant: 75000,
        date: '20/02/2026',
        statut: 'Création',
      },
    ];
  }
}
