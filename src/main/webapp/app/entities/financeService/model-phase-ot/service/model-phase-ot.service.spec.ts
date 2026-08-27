import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IModelPhaseOT } from '../model-phase-ot.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../model-phase-ot.test-samples';

import { ModelPhaseOTService } from './model-phase-ot.service';

const requireRestSample: IModelPhaseOT = {
  ...sampleWithRequiredData,
};

describe('ModelPhaseOT Service', () => {
  let service: ModelPhaseOTService;
  let httpMock: HttpTestingController;
  let expectedResult: IModelPhaseOT | IModelPhaseOT[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ModelPhaseOTService);
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

    it('should create a ModelPhaseOT', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const modelPhaseOT = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(modelPhaseOT).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ModelPhaseOT', () => {
      const modelPhaseOT = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(modelPhaseOT).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ModelPhaseOT', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ModelPhaseOT', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ModelPhaseOT', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addModelPhaseOTToCollectionIfMissing', () => {
      it('should add a ModelPhaseOT to an empty array', () => {
        const modelPhaseOT: IModelPhaseOT = sampleWithRequiredData;
        expectedResult = service.addModelPhaseOTToCollectionIfMissing([], modelPhaseOT);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(modelPhaseOT);
      });

      it('should not add a ModelPhaseOT to an array that contains it', () => {
        const modelPhaseOT: IModelPhaseOT = sampleWithRequiredData;
        const modelPhaseOTCollection: IModelPhaseOT[] = [
          {
            ...modelPhaseOT,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addModelPhaseOTToCollectionIfMissing(modelPhaseOTCollection, modelPhaseOT);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ModelPhaseOT to an array that doesn't contain it", () => {
        const modelPhaseOT: IModelPhaseOT = sampleWithRequiredData;
        const modelPhaseOTCollection: IModelPhaseOT[] = [sampleWithPartialData];
        expectedResult = service.addModelPhaseOTToCollectionIfMissing(modelPhaseOTCollection, modelPhaseOT);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(modelPhaseOT);
      });

      it('should add only unique ModelPhaseOT to an array', () => {
        const modelPhaseOTArray: IModelPhaseOT[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const modelPhaseOTCollection: IModelPhaseOT[] = [sampleWithRequiredData];
        expectedResult = service.addModelPhaseOTToCollectionIfMissing(modelPhaseOTCollection, ...modelPhaseOTArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const modelPhaseOT: IModelPhaseOT = sampleWithRequiredData;
        const modelPhaseOT2: IModelPhaseOT = sampleWithPartialData;
        expectedResult = service.addModelPhaseOTToCollectionIfMissing([], modelPhaseOT, modelPhaseOT2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(modelPhaseOT);
        expect(expectedResult).toContain(modelPhaseOT2);
      });

      it('should accept null and undefined values', () => {
        const modelPhaseOT: IModelPhaseOT = sampleWithRequiredData;
        expectedResult = service.addModelPhaseOTToCollectionIfMissing([], null, modelPhaseOT, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(modelPhaseOT);
      });

      it('should return initial array if no ModelPhaseOT is added', () => {
        const modelPhaseOTCollection: IModelPhaseOT[] = [sampleWithRequiredData];
        expectedResult = service.addModelPhaseOTToCollectionIfMissing(modelPhaseOTCollection, undefined, null);
        expect(expectedResult).toEqual(modelPhaseOTCollection);
      });
    });

    describe('compareModelPhaseOT', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareModelPhaseOT(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareModelPhaseOT(entity1, entity2);
        const compareResult2 = service.compareModelPhaseOT(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareModelPhaseOT(entity1, entity2);
        const compareResult2 = service.compareModelPhaseOT(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareModelPhaseOT(entity1, entity2);
        const compareResult2 = service.compareModelPhaseOT(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
