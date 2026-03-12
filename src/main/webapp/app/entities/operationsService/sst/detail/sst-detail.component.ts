import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISST } from '../sst.model';

@Component({
  selector: 'jhi-sst-detail',
  templateUrl: './sst-detail.component.html',
})
export class SSTDetailComponent implements OnInit {
  sST: ISST | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ sST }) => {
      this.sST = sST;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
