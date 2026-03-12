jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleDemandeAchatService } from '../service/article-demande-achat.service';

import { ArticleDemandeAchatDeleteDialogComponent } from './article-demande-achat-delete-dialog.component';

describe('ArticleDemandeAchat Management Delete Component', () => {
  let comp: ArticleDemandeAchatDeleteDialogComponent;
  let fixture: ComponentFixture<ArticleDemandeAchatDeleteDialogComponent>;
  let service: ArticleDemandeAchatService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ArticleDemandeAchatDeleteDialogComponent],
      providers: [NgbActiveModal],
    })
      .overrideTemplate(ArticleDemandeAchatDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ArticleDemandeAchatDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ArticleDemandeAchatService);
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
