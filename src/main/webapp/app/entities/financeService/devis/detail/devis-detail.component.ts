import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDevis } from '../devis.model';

@Component({
  selector: 'jhi-devis-detail',
  templateUrl: './devis-detail.component.html',
})
export class DevisDetailComponent implements OnInit {
  devis: IDevis | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ devis }) => {
      this.devis = devis;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
