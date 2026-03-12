import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IDevis } from '../devis.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../devis.test-samples';

import { DevisService, RestDevis } from './devis.service';

const requireRestSample: RestDevis = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Devis Service', () => {
  let service: DevisService;
  let httpMock: HttpTestingController;
  let expectedResult: IDevis | IDevis[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(DevisService);
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

    it('should create a Devis', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const devis = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(devis).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Devis', () => {
      const devis = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(devis).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Devis', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Devis', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Devis', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDevisToCollectionIfMissing', () => {
      it('should add a Devis to an empty array', () => {
        const devis: IDevis = sampleWithRequiredData;
        expectedResult = service.addDevisToCollectionIfMissing([], devis);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(devis);
      });

      it('should not add a Devis to an array that contains it', () => {
        const devis: IDevis = sampleWithRequiredData;
        const devisCollection: IDevis[] = [
          {
            ...devis,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDevisToCollectionIfMissing(devisCollection, devis);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Devis to an array that doesn't contain it", () => {
        const devis: IDevis = sampleWithRequiredData;
        const devisCollection: IDevis[] = [sampleWithPartialData];
        expectedResult = service.addDevisToCollectionIfMissing(devisCollection, devis);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(devis);
      });

      it('should add only unique Devis to an array', () => {
        const devisArray: IDevis[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const devisCollection: IDevis[] = [sampleWithRequiredData];
        expectedResult = service.addDevisToCollectionIfMissing(devisCollection, ...devisArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const devis: IDevis = sampleWithRequiredData;
        const devis2: IDevis = sampleWithPartialData;
        expectedResult = service.addDevisToCollectionIfMissing([], devis, devis2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(devis);
        expect(expectedResult).toContain(devis2);
      });

      it('should accept null and undefined values', () => {
        const devis: IDevis = sampleWithRequiredData;
        expectedResult = service.addDevisToCollectionIfMissing([], null, devis, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(devis);
      });

      it('should return initial array if no Devis is added', () => {
        const devisCollection: IDevis[] = [sampleWithRequiredData];
        expectedResult = service.addDevisToCollectionIfMissing(devisCollection, undefined, null);
        expect(expectedResult).toEqual(devisCollection);
      });
    });

    describe('compareDevis', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDevis(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareDevis(entity1, entity2);
        const compareResult2 = service.compareDevis(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareDevis(entity1, entity2);
        const compareResult2 = service.compareDevis(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareDevis(entity1, entity2);
        const compareResult2 = service.compareDevis(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
