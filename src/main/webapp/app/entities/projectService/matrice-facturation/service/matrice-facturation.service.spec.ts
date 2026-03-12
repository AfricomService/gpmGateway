import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IMatriceFacturation } from '../matrice-facturation.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../matrice-facturation.test-samples';

import { MatriceFacturationService } from './matrice-facturation.service';

const requireRestSample: IMatriceFacturation = {
  ...sampleWithRequiredData,
};

describe('MatriceFacturation Service', () => {
  let service: MatriceFacturationService;
  let httpMock: HttpTestingController;
  let expectedResult: IMatriceFacturation | IMatriceFacturation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(MatriceFacturationService);
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

    it('should create a MatriceFacturation', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const matriceFacturation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(matriceFacturation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a MatriceFacturation', () => {
      const matriceFacturation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(matriceFacturation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a MatriceFacturation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of MatriceFacturation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a MatriceFacturation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addMatriceFacturationToCollectionIfMissing', () => {
      it('should add a MatriceFacturation to an empty array', () => {
        const matriceFacturation: IMatriceFacturation = sampleWithRequiredData;
        expectedResult = service.addMatriceFacturationToCollectionIfMissing([], matriceFacturation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(matriceFacturation);
      });

      it('should not add a MatriceFacturation to an array that contains it', () => {
        const matriceFacturation: IMatriceFacturation = sampleWithRequiredData;
        const matriceFacturationCollection: IMatriceFacturation[] = [
          {
            ...matriceFacturation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addMatriceFacturationToCollectionIfMissing(matriceFacturationCollection, matriceFacturation);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a MatriceFacturation to an array that doesn't contain it", () => {
        const matriceFacturation: IMatriceFacturation = sampleWithRequiredData;
        const matriceFacturationCollection: IMatriceFacturation[] = [sampleWithPartialData];
        expectedResult = service.addMatriceFacturationToCollectionIfMissing(matriceFacturationCollection, matriceFacturation);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(matriceFacturation);
      });

      it('should add only unique MatriceFacturation to an array', () => {
        const matriceFacturationArray: IMatriceFacturation[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const matriceFacturationCollection: IMatriceFacturation[] = [sampleWithRequiredData];
        expectedResult = service.addMatriceFacturationToCollectionIfMissing(matriceFacturationCollection, ...matriceFacturationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const matriceFacturation: IMatriceFacturation = sampleWithRequiredData;
        const matriceFacturation2: IMatriceFacturation = sampleWithPartialData;
        expectedResult = service.addMatriceFacturationToCollectionIfMissing([], matriceFacturation, matriceFacturation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(matriceFacturation);
        expect(expectedResult).toContain(matriceFacturation2);
      });

      it('should accept null and undefined values', () => {
        const matriceFacturation: IMatriceFacturation = sampleWithRequiredData;
        expectedResult = service.addMatriceFacturationToCollectionIfMissing([], null, matriceFacturation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(matriceFacturation);
      });

      it('should return initial array if no MatriceFacturation is added', () => {
        const matriceFacturationCollection: IMatriceFacturation[] = [sampleWithRequiredData];
        expectedResult = service.addMatriceFacturationToCollectionIfMissing(matriceFacturationCollection, undefined, null);
        expect(expectedResult).toEqual(matriceFacturationCollection);
      });
    });

    describe('compareMatriceFacturation', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareMatriceFacturation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareMatriceFacturation(entity1, entity2);
        const compareResult2 = service.compareMatriceFacturation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareMatriceFacturation(entity1, entity2);
        const compareResult2 = service.compareMatriceFacturation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareMatriceFacturation(entity1, entity2);
        const compareResult2 = service.compareMatriceFacturation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
