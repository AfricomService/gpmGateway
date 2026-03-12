import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDemandeAchat } from '../demande-achat.model';

@Component({
  selector: 'jhi-demande-achat-detail',
  templateUrl: './demande-achat-detail.component.html',
})
export class DemandeAchatDetailComponent implements OnInit {
  demandeAchat: IDemandeAchat | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ demandeAchat }) => {
      this.demandeAchat = demandeAchat;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
