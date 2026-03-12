import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IWoUtilisateur } from '../wo-utilisateur.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../wo-utilisateur.test-samples';

import { WoUtilisateurService } from './wo-utilisateur.service';

const requireRestSample: IWoUtilisateur = {
  ...sampleWithRequiredData,
};

describe('WoUtilisateur Service', () => {
  let service: WoUtilisateurService;
  let httpMock: HttpTestingController;
  let expectedResult: IWoUtilisateur | IWoUtilisateur[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(WoUtilisateurService);
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

    it('should create a WoUtilisateur', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const woUtilisateur = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(woUtilisateur).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a WoUtilisateur', () => {
      const woUtilisateur = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(woUtilisateur).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a WoUtilisateur', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of WoUtilisateur', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a WoUtilisateur', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addWoUtilisateurToCollectionIfMissing', () => {
      it('should add a WoUtilisateur to an empty array', () => {
        const woUtilisateur: IWoUtilisateur = sampleWithRequiredData;
        expectedResult = service.addWoUtilisateurToCollectionIfMissing([], woUtilisateur);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(woUtilisateur);
      });

      it('should not add a WoUtilisateur to an array that contains it', () => {
        const woUtilisateur: IWoUtilisateur = sampleWithRequiredData;
        const woUtilisateurCollection: IWoUtilisateur[] = [
          {
            ...woUtilisateur,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addWoUtilisateurToCollectionIfMissing(woUtilisateurCollection, woUtilisateur);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a WoUtilisateur to an array that doesn't contain it", () => {
        const woUtilisateur: IWoUtilisateur = sampleWithRequiredData;
        const woUtilisateurCollection: IWoUtilisateur[] = [sampleWithPartialData];
        expectedResult = service.addWoUtilisateurToCollectionIfMissing(woUtilisateurCollection, woUtilisateur);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(woUtilisateur);
      });

      it('should add only unique WoUtilisateur to an array', () => {
        const woUtilisateurArray: IWoUtilisateur[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const woUtilisateurCollection: IWoUtilisateur[] = [sampleWithRequiredData];
        expectedResult = service.addWoUtilisateurToCollectionIfMissing(woUtilisateurCollection, ...woUtilisateurArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const woUtilisateur: IWoUtilisateur = sampleWithRequiredData;
        const woUtilisateur2: IWoUtilisateur = sampleWithPartialData;
        expectedResult = service.addWoUtilisateurToCollectionIfMissing([], woUtilisateur, woUtilisateur2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(woUtilisateur);
        expect(expectedResult).toContain(woUtilisateur2);
      });

      it('should accept null and undefined values', () => {
        const woUtilisateur: IWoUtilisateur = sampleWithRequiredData;
        expectedResult = service.addWoUtilisateurToCollectionIfMissing([], null, woUtilisateur, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(woUtilisateur);
      });

      it('should return initial array if no WoUtilisateur is added', () => {
        const woUtilisateurCollection: IWoUtilisateur[] = [sampleWithRequiredData];
        expectedResult = service.addWoUtilisateurToCollectionIfMissing(woUtilisateurCollection, undefined, null);
        expect(expectedResult).toEqual(woUtilisateurCollection);
      });
    });

    describe('compareWoUtilisateur', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareWoUtilisateur(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareWoUtilisateur(entity1, entity2);
        const compareResult2 = service.compareWoUtilisateur(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareWoUtilisateur(entity1, entity2);
        const compareResult2 = service.compareWoUtilisateur(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareWoUtilisateur(entity1, entity2);
        const compareResult2 = service.compareWoUtilisateur(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
