import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IWorkOrder } from '../work-order.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../work-order.test-samples';

import { WorkOrderService, RestWorkOrder } from './work-order.service';

const requireRestSample: RestWorkOrder = {
  ...sampleWithRequiredData,
  dateHeureDebutPrev: sampleWithRequiredData.dateHeureDebutPrev?.toJSON(),
  dateHeureFinPrev: sampleWithRequiredData.dateHeureFinPrev?.toJSON(),
  dateHeureDebutReel: sampleWithRequiredData.dateHeureDebutReel?.toJSON(),
  dateHeureFinReel: sampleWithRequiredData.dateHeureFinReel?.toJSON(),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('WorkOrder Service', () => {
  let service: WorkOrderService;
  let httpMock: HttpTestingController;
  let expectedResult: IWorkOrder | IWorkOrder[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(WorkOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a WorkOrder', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const workOrder = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(workOrder).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a WorkOrder', () => {
      const workOrder = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(workOrder).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a WorkOrder', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of WorkOrder', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a WorkOrder', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addWorkOrderToCollectionIfMissing', () => {
      it('should add a WorkOrder to an empty array', () => {
        const workOrder: IWorkOrder = sampleWithRequiredData;
        expectedResult = service.addWorkOrderToCollectionIfMissing([], workOrder);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(workOrder);
      });

      it('should not add a WorkOrder to an array that contains it', () => {
        const workOrder: IWorkOrder = sampleWithRequiredData;
        const workOrderCollection: IWorkOrder[] = [
          {
            ...workOrder,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addWorkOrderToCollectionIfMissing(workOrderCollection, workOrder);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a WorkOrder to an array that doesn't contain it", () => {
        const workOrder: IWorkOrder = sampleWithRequiredData;
        const workOrderCollection: IWorkOrder[] = [sampleWithPartialData];
        expectedResult = service.addWorkOrderToCollectionIfMissing(workOrderCollection, workOrder);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(workOrder);
      });

      it('should add only unique WorkOrder to an array', () => {
        const workOrderArray: IWorkOrder[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const workOrderCollection: IWorkOrder[] = [sampleWithRequiredData];
        expectedResult = service.addWorkOrderToCollectionIfMissing(workOrderCollection, ...workOrderArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const workOrder: IWorkOrder = sampleWithRequiredData;
        const workOrder2: IWorkOrder = sampleWithPartialData;
        expectedResult = service.addWorkOrderToCollectionIfMissing([], workOrder, workOrder2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(workOrder);
        expect(expectedResult).toContain(workOrder2);
      });

      it('should accept null and undefined values', () => {
        const workOrder: IWorkOrder = sampleWithRequiredData;
        expectedResult = service.addWorkOrderToCollectionIfMissing([], null, workOrder, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(workOrder);
      });

      it('should return initial array if no WorkOrder is added', () => {
        const workOrderCollection: IWorkOrder[] = [sampleWithRequiredData];
        expectedResult = service.addWorkOrderToCollectionIfMissing(workOrderCollection, undefined, null);
        expect(expectedResult).toEqual(workOrderCollection);
      });
    });

    describe('compareWorkOrder', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareWorkOrder(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareWorkOrder(entity1, entity2);
        const compareResult2 = service.compareWorkOrder(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareWorkOrder(entity1, entity2);
        const compareResult2 = service.compareWorkOrder(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareWorkOrder(entity1, entity2);
        const compareResult2 = service.compareWorkOrder(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
