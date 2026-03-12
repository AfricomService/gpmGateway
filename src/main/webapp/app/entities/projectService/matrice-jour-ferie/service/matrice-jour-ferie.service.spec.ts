import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IMatriceJourFerie } from '../matrice-jour-ferie.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../matrice-jour-ferie.test-samples';

import { MatriceJourFerieService } from './matrice-jour-ferie.service';

const requireRestSample: IMatriceJourFerie = {
  ...sampleWithRequiredData,
};

describe('MatriceJourFerie Service', () => {
  let service: MatriceJourFerieService;
  let httpMock: HttpTestingController;
  let expectedResult: IMatriceJourFerie | IMatriceJourFerie[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(MatriceJourFerieService);
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

    it('should create a MatriceJourFerie', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const matriceJourFerie = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(matriceJourFerie).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a MatriceJourFerie', () => {
      const matriceJourFerie = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(matriceJourFerie).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a MatriceJourFerie', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of MatriceJourFerie', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a MatriceJourFerie', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addMatriceJourFerieToCollectionIfMissing', () => {
      it('should add a MatriceJourFerie to an empty array', () => {
        const matriceJourFerie: IMatriceJourFerie = sampleWithRequiredData;
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing([], matriceJourFerie);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(matriceJourFerie);
      });

      it('should not add a MatriceJourFerie to an array that contains it', () => {
        const matriceJourFerie: IMatriceJourFerie = sampleWithRequiredData;
        const matriceJourFerieCollection: IMatriceJourFerie[] = [
          {
            ...matriceJourFerie,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing(matriceJourFerieCollection, matriceJourFerie);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a MatriceJourFerie to an array that doesn't contain it", () => {
        const matriceJourFerie: IMatriceJourFerie = sampleWithRequiredData;
        const matriceJourFerieCollection: IMatriceJourFerie[] = [sampleWithPartialData];
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing(matriceJourFerieCollection, matriceJourFerie);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(matriceJourFerie);
      });

      it('should add only unique MatriceJourFerie to an array', () => {
        const matriceJourFerieArray: IMatriceJourFerie[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const matriceJourFerieCollection: IMatriceJourFerie[] = [sampleWithRequiredData];
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing(matriceJourFerieCollection, ...matriceJourFerieArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const matriceJourFerie: IMatriceJourFerie = sampleWithRequiredData;
        const matriceJourFerie2: IMatriceJourFerie = sampleWithPartialData;
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing([], matriceJourFerie, matriceJourFerie2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(matriceJourFerie);
        expect(expectedResult).toContain(matriceJourFerie2);
      });

      it('should accept null and undefined values', () => {
        const matriceJourFerie: IMatriceJourFerie = sampleWithRequiredData;
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing([], null, matriceJourFerie, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(matriceJourFerie);
      });

      it('should return initial array if no MatriceJourFerie is added', () => {
        const matriceJourFerieCollection: IMatriceJourFerie[] = [sampleWithRequiredData];
        expectedResult = service.addMatriceJourFerieToCollectionIfMissing(matriceJourFerieCollection, undefined, null);
        expect(expectedResult).toEqual(matriceJourFerieCollection);
      });
    });

    describe('compareMatriceJourFerie', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareMatriceJourFerie(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareMatriceJourFerie(entity1, entity2);
        const compareResult2 = service.compareMatriceJourFerie(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareMatriceJourFerie(entity1, entity2);
        const compareResult2 = service.compareMatriceJourFerie(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareMatriceJourFerie(entity1, entity2);
        const compareResult2 = service.compareMatriceJourFerie(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
