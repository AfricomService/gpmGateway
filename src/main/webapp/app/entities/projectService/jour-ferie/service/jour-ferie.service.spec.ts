import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IJourFerie } from '../jour-ferie.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../jour-ferie.test-samples';

import { JourFerieService, RestJourFerie } from './jour-ferie.service';

const requireRestSample: RestJourFerie = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.format(DATE_FORMAT),
};

describe('JourFerie Service', () => {
  let service: JourFerieService;
  let httpMock: HttpTestingController;
  let expectedResult: IJourFerie | IJourFerie[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(JourFerieService);
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

    it('should create a JourFerie', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const jourFerie = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(jourFerie).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a JourFerie', () => {
      const jourFerie = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(jourFerie).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a JourFerie', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of JourFerie', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a JourFerie', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addJourFerieToCollectionIfMissing', () => {
      it('should add a JourFerie to an empty array', () => {
        const jourFerie: IJourFerie = sampleWithRequiredData;
        expectedResult = service.addJourFerieToCollectionIfMissing([], jourFerie);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(jourFerie);
      });

      it('should not add a JourFerie to an array that contains it', () => {
        const jourFerie: IJourFerie = sampleWithRequiredData;
        const jourFerieCollection: IJourFerie[] = [
          {
            ...jourFerie,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addJourFerieToCollectionIfMissing(jourFerieCollection, jourFerie);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a JourFerie to an array that doesn't contain it", () => {
        const jourFerie: IJourFerie = sampleWithRequiredData;
        const jourFerieCollection: IJourFerie[] = [sampleWithPartialData];
        expectedResult = service.addJourFerieToCollectionIfMissing(jourFerieCollection, jourFerie);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(jourFerie);
      });

      it('should add only unique JourFerie to an array', () => {
        const jourFerieArray: IJourFerie[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const jourFerieCollection: IJourFerie[] = [sampleWithRequiredData];
        expectedResult = service.addJourFerieToCollectionIfMissing(jourFerieCollection, ...jourFerieArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const jourFerie: IJourFerie = sampleWithRequiredData;
        const jourFerie2: IJourFerie = sampleWithPartialData;
        expectedResult = service.addJourFerieToCollectionIfMissing([], jourFerie, jourFerie2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(jourFerie);
        expect(expectedResult).toContain(jourFerie2);
      });

      it('should accept null and undefined values', () => {
        const jourFerie: IJourFerie = sampleWithRequiredData;
        expectedResult = service.addJourFerieToCollectionIfMissing([], null, jourFerie, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(jourFerie);
      });

      it('should return initial array if no JourFerie is added', () => {
        const jourFerieCollection: IJourFerie[] = [sampleWithRequiredData];
        expectedResult = service.addJourFerieToCollectionIfMissing(jourFerieCollection, undefined, null);
        expect(expectedResult).toEqual(jourFerieCollection);
      });
    });

    describe('compareJourFerie', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareJourFerie(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareJourFerie(entity1, entity2);
        const compareResult2 = service.compareJourFerie(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareJourFerie(entity1, entity2);
        const compareResult2 = service.compareJourFerie(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareJourFerie(entity1, entity2);
        const compareResult2 = service.compareJourFerie(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
