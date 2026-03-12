import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IDepenseDiverse } from '../depense-diverse.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../depense-diverse.test-samples';

import { DepenseDiverseService, RestDepenseDiverse } from './depense-diverse.service';

const requireRestSample: RestDepenseDiverse = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('DepenseDiverse Service', () => {
  let service: DepenseDiverseService;
  let httpMock: HttpTestingController;
  let expectedResult: IDepenseDiverse | IDepenseDiverse[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(DepenseDiverseService);
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

    it('should create a DepenseDiverse', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const depenseDiverse = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(depenseDiverse).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a DepenseDiverse', () => {
      const depenseDiverse = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(depenseDiverse).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a DepenseDiverse', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of DepenseDiverse', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a DepenseDiverse', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDepenseDiverseToCollectionIfMissing', () => {
      it('should add a DepenseDiverse to an empty array', () => {
        const depenseDiverse: IDepenseDiverse = sampleWithRequiredData;
        expectedResult = service.addDepenseDiverseToCollectionIfMissing([], depenseDiverse);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(depenseDiverse);
      });

      it('should not add a DepenseDiverse to an array that contains it', () => {
        const depenseDiverse: IDepenseDiverse = sampleWithRequiredData;
        const depenseDiverseCollection: IDepenseDiverse[] = [
          {
            ...depenseDiverse,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDepenseDiverseToCollectionIfMissing(depenseDiverseCollection, depenseDiverse);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a DepenseDiverse to an array that doesn't contain it", () => {
        const depenseDiverse: IDepenseDiverse = sampleWithRequiredData;
        const depenseDiverseCollection: IDepenseDiverse[] = [sampleWithPartialData];
        expectedResult = service.addDepenseDiverseToCollectionIfMissing(depenseDiverseCollection, depenseDiverse);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(depenseDiverse);
      });

      it('should add only unique DepenseDiverse to an array', () => {
        const depenseDiverseArray: IDepenseDiverse[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const depenseDiverseCollection: IDepenseDiverse[] = [sampleWithRequiredData];
        expectedResult = service.addDepenseDiverseToCollectionIfMissing(depenseDiverseCollection, ...depenseDiverseArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const depenseDiverse: IDepenseDiverse = sampleWithRequiredData;
        const depenseDiverse2: IDepenseDiverse = sampleWithPartialData;
        expectedResult = service.addDepenseDiverseToCollectionIfMissing([], depenseDiverse, depenseDiverse2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(depenseDiverse);
        expect(expectedResult).toContain(depenseDiverse2);
      });

      it('should accept null and undefined values', () => {
        const depenseDiverse: IDepenseDiverse = sampleWithRequiredData;
        expectedResult = service.addDepenseDiverseToCollectionIfMissing([], null, depenseDiverse, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(depenseDiverse);
      });

      it('should return initial array if no DepenseDiverse is added', () => {
        const depenseDiverseCollection: IDepenseDiverse[] = [sampleWithRequiredData];
        expectedResult = service.addDepenseDiverseToCollectionIfMissing(depenseDiverseCollection, undefined, null);
        expect(expectedResult).toEqual(depenseDiverseCollection);
      });
    });

    describe('compareDepenseDiverse', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDepenseDiverse(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareDepenseDiverse(entity1, entity2);
        const compareResult2 = service.compareDepenseDiverse(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareDepenseDiverse(entity1, entity2);
        const compareResult2 = service.compareDepenseDiverse(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareDepenseDiverse(entity1, entity2);
        const compareResult2 = service.compareDepenseDiverse(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
