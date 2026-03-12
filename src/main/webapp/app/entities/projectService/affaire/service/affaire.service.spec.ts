import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IAffaire } from '../affaire.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../affaire.test-samples';

import { AffaireService, RestAffaire } from './affaire.service';

const requireRestSample: RestAffaire = {
  ...sampleWithRequiredData,
  dateDebut: sampleWithRequiredData.dateDebut?.format(DATE_FORMAT),
  dateCloture: sampleWithRequiredData.dateCloture?.format(DATE_FORMAT),
  datePassageExecution: sampleWithRequiredData.datePassageExecution?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Affaire Service', () => {
  let service: AffaireService;
  let httpMock: HttpTestingController;
  let expectedResult: IAffaire | IAffaire[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(AffaireService);
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

    it('should create a Affaire', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const affaire = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(affaire).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Affaire', () => {
      const affaire = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(affaire).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Affaire', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Affaire', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Affaire', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addAffaireToCollectionIfMissing', () => {
      it('should add a Affaire to an empty array', () => {
        const affaire: IAffaire = sampleWithRequiredData;
        expectedResult = service.addAffaireToCollectionIfMissing([], affaire);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(affaire);
      });

      it('should not add a Affaire to an array that contains it', () => {
        const affaire: IAffaire = sampleWithRequiredData;
        const affaireCollection: IAffaire[] = [
          {
            ...affaire,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAffaireToCollectionIfMissing(affaireCollection, affaire);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Affaire to an array that doesn't contain it", () => {
        const affaire: IAffaire = sampleWithRequiredData;
        const affaireCollection: IAffaire[] = [sampleWithPartialData];
        expectedResult = service.addAffaireToCollectionIfMissing(affaireCollection, affaire);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(affaire);
      });

      it('should add only unique Affaire to an array', () => {
        const affaireArray: IAffaire[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const affaireCollection: IAffaire[] = [sampleWithRequiredData];
        expectedResult = service.addAffaireToCollectionIfMissing(affaireCollection, ...affaireArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const affaire: IAffaire = sampleWithRequiredData;
        const affaire2: IAffaire = sampleWithPartialData;
        expectedResult = service.addAffaireToCollectionIfMissing([], affaire, affaire2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(affaire);
        expect(expectedResult).toContain(affaire2);
      });

      it('should accept null and undefined values', () => {
        const affaire: IAffaire = sampleWithRequiredData;
        expectedResult = service.addAffaireToCollectionIfMissing([], null, affaire, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(affaire);
      });

      it('should return initial array if no Affaire is added', () => {
        const affaireCollection: IAffaire[] = [sampleWithRequiredData];
        expectedResult = service.addAffaireToCollectionIfMissing(affaireCollection, undefined, null);
        expect(expectedResult).toEqual(affaireCollection);
      });
    });

    describe('compareAffaire', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAffaire(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareAffaire(entity1, entity2);
        const compareResult2 = service.compareAffaire(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareAffaire(entity1, entity2);
        const compareResult2 = service.compareAffaire(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareAffaire(entity1, entity2);
        const compareResult2 = service.compareAffaire(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
