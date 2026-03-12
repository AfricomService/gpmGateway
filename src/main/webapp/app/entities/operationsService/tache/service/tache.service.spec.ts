import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ITache } from '../tache.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../tache.test-samples';

import { TacheService } from './tache.service';

const requireRestSample: ITache = {
  ...sampleWithRequiredData,
};

describe('Tache Service', () => {
  let service: TacheService;
  let httpMock: HttpTestingController;
  let expectedResult: ITache | ITache[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(TacheService);
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

    it('should create a Tache', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tache = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(tache).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Tache', () => {
      const tache = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(tache).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Tache', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Tache', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Tache', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTacheToCollectionIfMissing', () => {
      it('should add a Tache to an empty array', () => {
        const tache: ITache = sampleWithRequiredData;
        expectedResult = service.addTacheToCollectionIfMissing([], tache);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tache);
      });

      it('should not add a Tache to an array that contains it', () => {
        const tache: ITache = sampleWithRequiredData;
        const tacheCollection: ITache[] = [
          {
            ...tache,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTacheToCollectionIfMissing(tacheCollection, tache);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Tache to an array that doesn't contain it", () => {
        const tache: ITache = sampleWithRequiredData;
        const tacheCollection: ITache[] = [sampleWithPartialData];
        expectedResult = service.addTacheToCollectionIfMissing(tacheCollection, tache);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tache);
      });

      it('should add only unique Tache to an array', () => {
        const tacheArray: ITache[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const tacheCollection: ITache[] = [sampleWithRequiredData];
        expectedResult = service.addTacheToCollectionIfMissing(tacheCollection, ...tacheArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const tache: ITache = sampleWithRequiredData;
        const tache2: ITache = sampleWithPartialData;
        expectedResult = service.addTacheToCollectionIfMissing([], tache, tache2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tache);
        expect(expectedResult).toContain(tache2);
      });

      it('should accept null and undefined values', () => {
        const tache: ITache = sampleWithRequiredData;
        expectedResult = service.addTacheToCollectionIfMissing([], null, tache, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tache);
      });

      it('should return initial array if no Tache is added', () => {
        const tacheCollection: ITache[] = [sampleWithRequiredData];
        expectedResult = service.addTacheToCollectionIfMissing(tacheCollection, undefined, null);
        expect(expectedResult).toEqual(tacheCollection);
      });
    });

    describe('compareTache', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTache(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareTache(entity1, entity2);
        const compareResult2 = service.compareTache(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareTache(entity1, entity2);
        const compareResult2 = service.compareTache(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareTache(entity1, entity2);
        const compareResult2 = service.compareTache(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
