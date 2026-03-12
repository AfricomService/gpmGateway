import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SocieteDetailComponent } from './societe-detail.component';

describe('Societe Management Detail Component', () => {
  let comp: SocieteDetailComponent;
  let fixture: ComponentFixture<SocieteDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SocieteDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ societe: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(SocieteDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SocieteDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load societe on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.societe).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
