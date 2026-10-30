import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IOtExterne } from 'app/entities/financeService/ot-externe/ot-externe.model';
import { OtExterneService } from 'app/entities/financeService/ot-externe/service/ot-externe.service';

const OT_EXTERNE_PAGE_SIZE = 20;

@Component({
  selector: 'jhi-ot-externe-selector-modal',
  templateUrl: './ot-externe-selector-modal.component.html',
  styleUrls: ['./ot-externe-selector-modal.component.scss'],
})
export class OtExterneSelectorModalComponent implements OnInit, OnDestroy {
  /**
   * Id du modèle de phases (Motif) sélectionné, injecté par le composant appelant via
   * `modalRef.componentInstance.modeleOtId = ...`.
   */
  @Input() modeleOtId: number | null = null;

  @Input() modalTitle = 'Sélectionner un OT externe';

  otExternes: IOtExterne[] = [];

  search = '';

  loading = false;

  private readonly searchSubject = new Subject<string>();

  constructor(public activeModal: NgbActiveModal, private otExterneService: OtExterneService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(search => {
      this.loadOtExternes(search);
    });

    // Chargement initial
    this.loadOtExternes('');
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  loadOtExternes(search: string): void {
    if (this.modeleOtId === null || this.modeleOtId === undefined) {
      this.otExternes = [];
      this.loading = false;
      return;
    }

    this.loading = true;

    this.otExterneService
      .findByModeleOt(this.modeleOtId, {
        page: 0,
        size: OT_EXTERNE_PAGE_SIZE,
        sort: ['reference,asc'],
        search,
      })
      .subscribe({
        next: (res: HttpResponse<IOtExterne[]>) => {
          this.otExternes = res.body ?? [];
          this.loading = false;
        },
        error: () => {
          this.otExternes = [];
          this.loading = false;
        },
      });
  }

  choose(otExterne: IOtExterne): void {
    this.activeModal.close(otExterne);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
