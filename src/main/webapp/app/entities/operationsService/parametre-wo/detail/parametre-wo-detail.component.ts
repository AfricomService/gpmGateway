import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IParametreWO } from '../parametre-wo.model';

@Component({
  selector: 'jhi-parametre-wo-detail',
  templateUrl: './parametre-wo-detail.component.html',
})
export class ParametreWODetailComponent implements OnInit {
  parametreWO: IParametreWO | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ parametreWO }) => {
      this.parametreWO = parametreWO;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
