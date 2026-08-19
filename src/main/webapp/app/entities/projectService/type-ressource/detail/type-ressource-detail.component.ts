import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITypeRessource } from '../type-ressource.model';

@Component({
  selector: 'jhi-type-ressource-detail',
  templateUrl: './type-ressource-detail.component.html',
})
export class TypeRessourceDetailComponent implements OnInit {
  typeRessource: ITypeRessource | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ typeRessource }) => {
      this.typeRessource = typeRessource;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
