jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PhaseOtService } from '../service/phase-ot.service';

import { PhaseOtDeleteDialogComponent } from './phase-ot-delete-dialog.component';

describe('PhaseOt Management Delete Component', () => {
  let comp: PhaseOtDeleteDialogComponent;
  let fixture: ComponentFixture<PhaseOtDeleteDialogComponent>;
  let service: PhaseOtService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PhaseOtDeleteDialogComponent],
      providers: [NgbActiveModal],
    })
      .overrideTemplate(PhaseOtDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(PhaseOtDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(PhaseOtService);
    mockActiveModal = TestBed.inject(NgbActiveModal);
  });

  describe('confirmDelete', () => {
    it('Should call delete service on confirmDelete', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(service, 'delete').mockReturnValue(of(new HttpResponse({ body: {} })));

        // WHEN
        comp.confirmDelete(123);
        tick();

        // THEN
        expect(service.delete).toHaveBeenCalledWith(123);
        expect(mockActiveModal.close).toHaveBeenCalledWith('deleted');
      })
    ));

    it('Should not call delete service on clear', () => {
      // GIVEN
      jest.spyOn(service, 'delete');

      // WHEN
      comp.cancel();

      // THEN
      expect(service.delete).not.toHaveBeenCalled();
      expect(mockActiveModal.close).not.toHaveBeenCalled();
      expect(mockActiveModal.dismiss).toHaveBeenCalled();
    });
  });
});
