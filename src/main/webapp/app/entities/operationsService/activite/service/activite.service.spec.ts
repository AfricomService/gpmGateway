import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IActivite } from '../activite.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../activite.test-samples';

import { ActiviteService, RestActivite } from './activite.service';

const requireRestSample: RestActivite = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Activite Service', () => {
  let service: ActiviteService;
  let httpMock: HttpTestingController;
  let expectedResult: IActivite | IActivite[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ActiviteService);
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

    it('should create a Activite', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const activite = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(activite).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Activite', () => {
      const activite = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(activite).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Activite', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Activite', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Activite', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addActiviteToCollectionIfMissing', () => {
      it('should add a Activite to an empty array', () => {
        const activite: IActivite = sampleWithRequiredData;
        expectedResult = service.addActiviteToCollectionIfMissing([], activite);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(activite);
      });

      it('should not add a Activite to an array that contains it', () => {
        const activite: IActivite = sampleWithRequiredData;
        const activiteCollection: IActivite[] = [
          {
            ...activite,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addActiviteToCollectionIfMissing(activiteCollection, activite);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Activite to an array that doesn't contain it", () => {
        const activite: IActivite = sampleWithRequiredData;
        const activiteCollection: IActivite[] = [sampleWithPartialData];
        expectedResult = service.addActiviteToCollectionIfMissing(activiteCollection, activite);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(activite);
      });

      it('should add only unique Activite to an array', () => {
        const activiteArray: IActivite[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const activiteCollection: IActivite[] = [sampleWithRequiredData];
        expectedResult = service.addActiviteToCollectionIfMissing(activiteCollection, ...activiteArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const activite: IActivite = sampleWithRequiredData;
        const activite2: IActivite = sampleWithPartialData;
        expectedResult = service.addActiviteToCollectionIfMissing([], activite, activite2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(activite);
        expect(expectedResult).toContain(activite2);
      });

      it('should accept null and undefined values', () => {
        const activite: IActivite = sampleWithRequiredData;
        expectedResult = service.addActiviteToCollectionIfMissing([], null, activite, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(activite);
      });

      it('should return initial array if no Activite is added', () => {
        const activiteCollection: IActivite[] = [sampleWithRequiredData];
        expectedResult = service.addActiviteToCollectionIfMissing(activiteCollection, undefined, null);
        expect(expectedResult).toEqual(activiteCollection);
      });
    });

    describe('compareActivite', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareActivite(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareActivite(entity1, entity2);
        const compareResult2 = service.compareActivite(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareActivite(entity1, entity2);
        const compareResult2 = service.compareActivite(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareActivite(entity1, entity2);
        const compareResult2 = service.compareActivite(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
