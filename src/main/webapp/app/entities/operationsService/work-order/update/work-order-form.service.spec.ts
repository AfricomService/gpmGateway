import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../work-order.test-samples';

import { WorkOrderFormService } from './work-order-form.service';

describe('WorkOrder Form Service', () => {
  let service: WorkOrderFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderFormService);
  });

  describe('Service methods', () => {
    describe('createWorkOrderFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createWorkOrderFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            clientId: expect.any(Object),
            affaireId: expect.any(Object),
            demandeurContactId: expect.any(Object),
            vehiculeId: expect.any(Object),
            otExterneId: expect.any(Object),
            valideurId: expect.any(Object),
            valideurUserLogin: expect.any(Object),
            dateHeureDebutPrev: expect.any(Object),
            dateHeureFinPrev: expect.any(Object),
            dateHeureDebutReel: expect.any(Object),
            dateHeureFinReel: expect.any(Object),
            missionDeNuit: expect.any(Object),
            nombreNuits: expect.any(Object),
            hebergement: expect.any(Object),
            nombreHebergements: expect.any(Object),
            remarque: expect.any(Object),
            numFicheIntervention: expect.any(Object),
            statut: expect.any(Object),
            materielUtilise: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IWorkOrder should create a new form with FormGroup', () => {
        const formGroup = service.createWorkOrderFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            clientId: expect.any(Object),
            affaireId: expect.any(Object),
            demandeurContactId: expect.any(Object),
            vehiculeId: expect.any(Object),
            otExterneId: expect.any(Object),
            valideurId: expect.any(Object),
            valideurUserLogin: expect.any(Object),
            dateHeureDebutPrev: expect.any(Object),
            dateHeureFinPrev: expect.any(Object),
            dateHeureDebutReel: expect.any(Object),
            dateHeureFinReel: expect.any(Object),
            missionDeNuit: expect.any(Object),
            nombreNuits: expect.any(Object),
            hebergement: expect.any(Object),
            nombreHebergements: expect.any(Object),
            remarque: expect.any(Object),
            numFicheIntervention: expect.any(Object),
            statut: expect.any(Object),
            materielUtilise: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });
    });

    describe('getWorkOrder', () => {
      it('should return NewWorkOrder for default WorkOrder initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createWorkOrderFormGroup(sampleWithNewData);

        const workOrder = service.getWorkOrder(formGroup) as any;

        expect(workOrder).toMatchObject(sampleWithNewData);
      });

      it('should return NewWorkOrder for empty WorkOrder initial value', () => {
        const formGroup = service.createWorkOrderFormGroup();

        const workOrder = service.getWorkOrder(formGroup) as any;

        expect(workOrder).toMatchObject({});
      });

      it('should return IWorkOrder', () => {
        const formGroup = service.createWorkOrderFormGroup(sampleWithRequiredData);

        const workOrder = service.getWorkOrder(formGroup) as any;

        expect(workOrder).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IWorkOrder should not enable id FormControl', () => {
        const formGroup = service.createWorkOrderFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewWorkOrder should disable id FormControl', () => {
        const formGroup = service.createWorkOrderFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
