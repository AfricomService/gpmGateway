import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWoMotif } from '../wo-motif.model';

@Component({
  selector: 'jhi-wo-motif-detail',
  templateUrl: './wo-motif-detail.component.html',
})
export class WoMotifDetailComponent implements OnInit {
  woMotif: IWoMotif | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ woMotif }) => {
      this.woMotif = woMotif;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
