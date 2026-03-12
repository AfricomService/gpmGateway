import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISociete } from '../societe.model';

@Component({
  selector: 'jhi-societe-detail',
  templateUrl: './societe-detail.component.html',
})
export class SocieteDetailComponent implements OnInit {
  societe: ISociete | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ societe }) => {
      this.societe = societe;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
