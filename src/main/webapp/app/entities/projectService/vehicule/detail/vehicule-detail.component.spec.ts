import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { VehiculeDetailComponent } from './vehicule-detail.component';

describe('Vehicule Management Detail Component', () => {
  let comp: VehiculeDetailComponent;
  let fixture: ComponentFixture<VehiculeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VehiculeDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ vehicule: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(VehiculeDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(VehiculeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load vehicule on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.vehicule).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
