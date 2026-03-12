import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWoSite } from '../wo-site.model';

@Component({
  selector: 'jhi-wo-site-detail',
  templateUrl: './wo-site-detail.component.html',
})
export class WoSiteDetailComponent implements OnInit {
  woSite: IWoSite | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ woSite }) => {
      this.woSite = woSite;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
