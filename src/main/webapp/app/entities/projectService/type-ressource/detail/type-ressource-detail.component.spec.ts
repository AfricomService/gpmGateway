import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TypeRessourceDetailComponent } from './type-ressource-detail.component';

describe('TypeRessource Management Detail Component', () => {
  let comp: TypeRessourceDetailComponent;
  let fixture: ComponentFixture<TypeRessourceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeRessourceDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ typeRessource: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(TypeRessourceDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(TypeRessourceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load typeRessource on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.typeRessource).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
