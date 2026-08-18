import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IRessource } from '../ressource.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../ressource.test-samples';

import { RessourceService, RestRessource } from './ressource.service';

const requireRestSample: RestRessource = {
  ...sampleWithRequiredData,
  dateMiseEnService: sampleWithRequiredData.dateMiseEnService?.toJSON(),
  dateDerniereMaintenance: sampleWithRequiredData.dateDerniereMaintenance?.toJSON(),
  dateProchaineMaintenance: sampleWithRequiredData.dateProchaineMaintenance?.toJSON(),
};

describe('Ressource Service', () => {
  let service: RessourceService;
  let httpMock: HttpTestingController;
  let expectedResult: IRessource | IRessource[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(RessourceService);
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

    it('should create a Ressource', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ressource = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(ressource).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Ressource', () => {
      const ressource = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(ressource).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Ressource', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Ressource', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Ressource', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addRessourceToCollectionIfMissing', () => {
      it('should add a Ressource to an empty array', () => {
        const ressource: IRessource = sampleWithRequiredData;
        expectedResult = service.addRessourceToCollectionIfMissing([], ressource);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(ressource);
      });

      it('should not add a Ressource to an array that contains it', () => {
        const ressource: IRessource = sampleWithRequiredData;
        const ressourceCollection: IRessource[] = [
          {
            ...ressource,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRessourceToCollectionIfMissing(ressourceCollection, ressource);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Ressource to an array that doesn't contain it", () => {
        const ressource: IRessource = sampleWithRequiredData;
        const ressourceCollection: IRessource[] = [sampleWithPartialData];
        expectedResult = service.addRessourceToCollectionIfMissing(ressourceCollection, ressource);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(ressource);
      });

      it('should add only unique Ressource to an array', () => {
        const ressourceArray: IRessource[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const ressourceCollection: IRessource[] = [sampleWithRequiredData];
        expectedResult = service.addRessourceToCollectionIfMissing(ressourceCollection, ...ressourceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const ressource: IRessource = sampleWithRequiredData;
        const ressource2: IRessource = sampleWithPartialData;
        expectedResult = service.addRessourceToCollectionIfMissing([], ressource, ressource2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(ressource);
        expect(expectedResult).toContain(ressource2);
      });

      it('should accept null and undefined values', () => {
        const ressource: IRessource = sampleWithRequiredData;
        expectedResult = service.addRessourceToCollectionIfMissing([], null, ressource, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(ressource);
      });

      it('should return initial array if no Ressource is added', () => {
        const ressourceCollection: IRessource[] = [sampleWithRequiredData];
        expectedResult = service.addRessourceToCollectionIfMissing(ressourceCollection, undefined, null);
        expect(expectedResult).toEqual(ressourceCollection);
      });
    });

    describe('compareRessource', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRessource(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareRessource(entity1, entity2);
        const compareResult2 = service.compareRessource(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareRessource(entity1, entity2);
        const compareResult2 = service.compareRessource(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareRessource(entity1, entity2);
        const compareResult2 = service.compareRessource(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
