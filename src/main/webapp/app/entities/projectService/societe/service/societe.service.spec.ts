import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ISociete } from '../societe.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../societe.test-samples';

import { SocieteService, RestSociete } from './societe.service';

const requireRestSample: RestSociete = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Societe Service', () => {
  let service: SocieteService;
  let httpMock: HttpTestingController;
  let expectedResult: ISociete | ISociete[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(SocieteService);
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

    it('should create a Societe', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const societe = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(societe).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Societe', () => {
      const societe = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(societe).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Societe', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Societe', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Societe', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSocieteToCollectionIfMissing', () => {
      it('should add a Societe to an empty array', () => {
        const societe: ISociete = sampleWithRequiredData;
        expectedResult = service.addSocieteToCollectionIfMissing([], societe);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(societe);
      });

      it('should not add a Societe to an array that contains it', () => {
        const societe: ISociete = sampleWithRequiredData;
        const societeCollection: ISociete[] = [
          {
            ...societe,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSocieteToCollectionIfMissing(societeCollection, societe);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Societe to an array that doesn't contain it", () => {
        const societe: ISociete = sampleWithRequiredData;
        const societeCollection: ISociete[] = [sampleWithPartialData];
        expectedResult = service.addSocieteToCollectionIfMissing(societeCollection, societe);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(societe);
      });

      it('should add only unique Societe to an array', () => {
        const societeArray: ISociete[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const societeCollection: ISociete[] = [sampleWithRequiredData];
        expectedResult = service.addSocieteToCollectionIfMissing(societeCollection, ...societeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const societe: ISociete = sampleWithRequiredData;
        const societe2: ISociete = sampleWithPartialData;
        expectedResult = service.addSocieteToCollectionIfMissing([], societe, societe2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(societe);
        expect(expectedResult).toContain(societe2);
      });

      it('should accept null and undefined values', () => {
        const societe: ISociete = sampleWithRequiredData;
        expectedResult = service.addSocieteToCollectionIfMissing([], null, societe, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(societe);
      });

      it('should return initial array if no Societe is added', () => {
        const societeCollection: ISociete[] = [sampleWithRequiredData];
        expectedResult = service.addSocieteToCollectionIfMissing(societeCollection, undefined, null);
        expect(expectedResult).toEqual(societeCollection);
      });
    });

    describe('compareSociete', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSociete(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareSociete(entity1, entity2);
        const compareResult2 = service.compareSociete(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareSociete(entity1, entity2);
        const compareResult2 = service.compareSociete(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareSociete(entity1, entity2);
        const compareResult2 = service.compareSociete(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
