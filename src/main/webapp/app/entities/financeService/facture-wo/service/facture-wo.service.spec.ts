import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IFactureWO } from '../facture-wo.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../facture-wo.test-samples';

import { FactureWOService } from './facture-wo.service';

const requireRestSample: IFactureWO = {
  ...sampleWithRequiredData,
};

describe('FactureWO Service', () => {
  let service: FactureWOService;
  let httpMock: HttpTestingController;
  let expectedResult: IFactureWO | IFactureWO[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(FactureWOService);
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

    it('should create a FactureWO', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const factureWO = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(factureWO).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a FactureWO', () => {
      const factureWO = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(factureWO).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a FactureWO', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of FactureWO', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a FactureWO', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFactureWOToCollectionIfMissing', () => {
      it('should add a FactureWO to an empty array', () => {
        const factureWO: IFactureWO = sampleWithRequiredData;
        expectedResult = service.addFactureWOToCollectionIfMissing([], factureWO);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(factureWO);
      });

      it('should not add a FactureWO to an array that contains it', () => {
        const factureWO: IFactureWO = sampleWithRequiredData;
        const factureWOCollection: IFactureWO[] = [
          {
            ...factureWO,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFactureWOToCollectionIfMissing(factureWOCollection, factureWO);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a FactureWO to an array that doesn't contain it", () => {
        const factureWO: IFactureWO = sampleWithRequiredData;
        const factureWOCollection: IFactureWO[] = [sampleWithPartialData];
        expectedResult = service.addFactureWOToCollectionIfMissing(factureWOCollection, factureWO);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(factureWO);
      });

      it('should add only unique FactureWO to an array', () => {
        const factureWOArray: IFactureWO[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const factureWOCollection: IFactureWO[] = [sampleWithRequiredData];
        expectedResult = service.addFactureWOToCollectionIfMissing(factureWOCollection, ...factureWOArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const factureWO: IFactureWO = sampleWithRequiredData;
        const factureWO2: IFactureWO = sampleWithPartialData;
        expectedResult = service.addFactureWOToCollectionIfMissing([], factureWO, factureWO2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(factureWO);
        expect(expectedResult).toContain(factureWO2);
      });

      it('should accept null and undefined values', () => {
        const factureWO: IFactureWO = sampleWithRequiredData;
        expectedResult = service.addFactureWOToCollectionIfMissing([], null, factureWO, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(factureWO);
      });

      it('should return initial array if no FactureWO is added', () => {
        const factureWOCollection: IFactureWO[] = [sampleWithRequiredData];
        expectedResult = service.addFactureWOToCollectionIfMissing(factureWOCollection, undefined, null);
        expect(expectedResult).toEqual(factureWOCollection);
      });
    });

    describe('compareFactureWO', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFactureWO(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareFactureWO(entity1, entity2);
        const compareResult2 = service.compareFactureWO(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareFactureWO(entity1, entity2);
        const compareResult2 = service.compareFactureWO(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareFactureWO(entity1, entity2);
        const compareResult2 = service.compareFactureWO(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
