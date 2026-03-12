import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWoUtilisateur } from '../wo-utilisateur.model';

@Component({
  selector: 'jhi-wo-utilisateur-detail',
  templateUrl: './wo-utilisateur-detail.component.html',
})
export class WoUtilisateurDetailComponent implements OnInit {
  woUtilisateur: IWoUtilisateur | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ woUtilisateur }) => {
      this.woUtilisateur = woUtilisateur;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
