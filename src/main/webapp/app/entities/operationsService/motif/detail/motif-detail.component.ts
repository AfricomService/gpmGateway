import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMotif } from '../motif.model';

@Component({
  selector: 'jhi-motif-detail',
  templateUrl: './motif-detail.component.html',
})
export class MotifDetailComponent implements OnInit {
  motif: IMotif | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ motif }) => {
      this.motif = motif;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
