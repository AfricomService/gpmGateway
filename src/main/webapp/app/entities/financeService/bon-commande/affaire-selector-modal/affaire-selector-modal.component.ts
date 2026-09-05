import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';

const AFFAIRE_STATUT_DEFAULT = 'ExecutionDesTravaux';
const AFFAIRE_PAGE_SIZE = 20;

@Component({
  selector: 'jhi-affaire-selector-modal',
  templateUrl: './affaire-selector-modal.component.html',
  styleUrls: ['./affaire-selector-modal.component.scss'],
})
export class AffaireSelectorModalComponent implements OnInit, OnDestroy {
  /**
   * Statut à filtrer, injecté par le composant appelant via
   * `modalRef.componentInstance.statut = ...`. Valeur par défaut
   * conservée pour compatibilité si personne ne la fixe.
   */
  @Input() statut = AFFAIRE_STATUT_DEFAULT;

  affaires: IAffaire[] = [];

  search = '';

  loading = false;

  private readonly searchSubject = new Subject<string>();

  constructor(public activeModal: NgbActiveModal, private affaireService: AffaireService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(search => {
      this.loadAffaires(search);
    });

    // Chargement initial
    this.loadAffaires('');
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  loadAffaires(search: string): void {
    this.loading = true;

    this.affaireService
      .findByStatut(this.statut, search, {
        page: 0,
        size: AFFAIRE_PAGE_SIZE,
        sort: ['designationAffaire,asc'],
      })
      .subscribe({
        next: (res: HttpResponse<IAffaire[]>) => {
          this.affaires = res.body ?? [];
          this.loading = false;
        },
        error: () => {
          this.affaires = [];
          this.loading = false;
        },
      });
  }

  choose(affaire: IAffaire): void {
    this.activeModal.close(affaire);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
