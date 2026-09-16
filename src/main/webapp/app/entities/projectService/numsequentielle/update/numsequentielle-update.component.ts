import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { NumsequentielleFormService, NumsequentielleFormGroup } from './numsequentielle-form.service';
import { INumsequentielle } from '../numsequentielle.model';
import { NumsequentielleService } from '../service/numsequentielle.service';

@Component({
  selector: 'jhi-numsequentielle-update',
  templateUrl: './numsequentielle-update.component.html',
})
export class NumsequentielleUpdateComponent implements OnInit {
  isSaving = false;
  numsequentielle: INumsequentielle | null = null;

  previewResult: string | null = null;
  previewError: string | null = null;
  isTestingFormat = false;

  editForm: NumsequentielleFormGroup = this.numsequentielleFormService.createNumsequentielleFormGroup();

  constructor(
    protected numsequentielleService: NumsequentielleService,
    protected numsequentielleFormService: NumsequentielleFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ numsequentielle }) => {
      this.numsequentielle = numsequentielle;
      if (numsequentielle) {
        this.updateForm(numsequentielle);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  testerFormat(): void {
    const format = this.editForm.get('format')?.value;
    const codeNumSeq = this.editForm.get('codeNumSeq')?.value;

    this.previewResult = null;
    this.previewError = null;

    if (!format || !codeNumSeq) {
      this.previewError = 'Renseignez le Code Num Seq et le Format avant de tester.';
      return;
    }

    this.isTestingFormat = true;

    this.numsequentielleService.previewFormat(format, codeNumSeq).subscribe({
      next: res => {
        this.previewResult = res.body;
        this.isTestingFormat = false;
      },
      error: () => {
        this.previewError = 'Format invalide — vérifiez la syntaxe FreeMarker.';
        this.isTestingFormat = false;
      },
    });
  }

  save(): void {
    this.isSaving = true;
    const numsequentielle = this.numsequentielleFormService.getNumsequentielle(this.editForm);
    if (numsequentielle.id !== null) {
      this.subscribeToSaveResponse(this.numsequentielleService.update(numsequentielle));
    } else {
      this.subscribeToSaveResponse(this.numsequentielleService.create(numsequentielle));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<INumsequentielle>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(numsequentielle: INumsequentielle): void {
    this.numsequentielle = numsequentielle;
    this.numsequentielleFormService.resetForm(this.editForm, numsequentielle);
  }
}
