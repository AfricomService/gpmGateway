import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IOtExterne } from '../ot-externe.model';

@Component({
  selector: 'jhi-ot-externe-detail',
  templateUrl: './ot-externe-detail.component.html',
})
export class OtExterneDetailComponent implements OnInit {
  otExterne: IOtExterne | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ otExterne }) => {
      this.otExterne = otExterne;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
