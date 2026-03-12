import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { WorkOrderDetailComponent } from './work-order-detail.component';

describe('WorkOrder Management Detail Component', () => {
  let comp: WorkOrderDetailComponent;
  let fixture: ComponentFixture<WorkOrderDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkOrderDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ workOrder: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(WorkOrderDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(WorkOrderDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load workOrder on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.workOrder).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
