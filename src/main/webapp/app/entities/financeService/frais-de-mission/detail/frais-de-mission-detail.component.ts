import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFraisDeMission } from '../frais-de-mission.model';

@Component({
  selector: 'jhi-frais-de-mission-detail',
  templateUrl: './frais-de-mission-detail.component.html',
})
export class FraisDeMissionDetailComponent implements OnInit {
  fraisDeMission: IFraisDeMission | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ fraisDeMission }) => {
      this.fraisDeMission = fraisDeMission;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
