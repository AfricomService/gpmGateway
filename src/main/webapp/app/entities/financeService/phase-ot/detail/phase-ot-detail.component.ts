import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPhaseOt } from '../phase-ot.model';

@Component({
  selector: 'jhi-phase-ot-detail',
  templateUrl: './phase-ot-detail.component.html',
})
export class PhaseOtDetailComponent implements OnInit {
  phaseOt: IPhaseOt | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ phaseOt }) => {
      this.phaseOt = phaseOt;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
