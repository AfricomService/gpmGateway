import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IModelPhaseOT } from '../model-phase-ot.model';

@Component({
  selector: 'jhi-model-phase-ot-detail',
  templateUrl: './model-phase-ot-detail.component.html',
})
export class ModelPhaseOTDetailComponent implements OnInit {
  modelPhaseOT: IModelPhaseOT | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ modelPhaseOT }) => {
      this.modelPhaseOT = modelPhaseOT;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
