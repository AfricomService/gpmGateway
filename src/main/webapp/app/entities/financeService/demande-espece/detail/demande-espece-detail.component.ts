import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDemandeEspece } from '../demande-espece.model';

@Component({
  selector: 'jhi-demande-espece-detail',
  templateUrl: './demande-espece-detail.component.html',
})
export class DemandeEspeceDetailComponent implements OnInit {
  demandeEspece: IDemandeEspece | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ demandeEspece }) => {
      this.demandeEspece = demandeEspece;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
