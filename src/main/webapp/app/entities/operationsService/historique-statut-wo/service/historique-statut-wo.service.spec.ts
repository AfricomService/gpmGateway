import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IHistoriqueStatutWO } from '../historique-statut-wo.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../historique-statut-wo.test-samples';

import { HistoriqueStatutWOService, RestHistoriqueStatutWO } from './historique-statut-wo.service';

const requireRestSample: RestHistoriqueStatutWO = {
  ...sampleWithRequiredData,
  dateChangement: sampleWithRequiredData.dateChangement?.toJSON(),
};

describe('HistoriqueStatutWO Service', () => {
  let service: HistoriqueStatutWOService;
  let httpMock: HttpTestingController;
  let expectedResult: IHistoriqueStatutWO | IHistoriqueStatutWO[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(HistoriqueStatutWOService);
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

    it('should create a HistoriqueStatutWO', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const historiqueStatutWO = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(historiqueStatutWO).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a HistoriqueStatutWO', () => {
      const historiqueStatutWO = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(historiqueStatutWO).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a HistoriqueStatutWO', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of HistoriqueStatutWO', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a HistoriqueStatutWO', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addHistoriqueStatutWOToCollectionIfMissing', () => {
      it('should add a HistoriqueStatutWO to an empty array', () => {
        const historiqueStatutWO: IHistoriqueStatutWO = sampleWithRequiredData;
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing([], historiqueStatutWO);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(historiqueStatutWO);
      });

      it('should not add a HistoriqueStatutWO to an array that contains it', () => {
        const historiqueStatutWO: IHistoriqueStatutWO = sampleWithRequiredData;
        const historiqueStatutWOCollection: IHistoriqueStatutWO[] = [
          {
            ...historiqueStatutWO,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing(historiqueStatutWOCollection, historiqueStatutWO);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a HistoriqueStatutWO to an array that doesn't contain it", () => {
        const historiqueStatutWO: IHistoriqueStatutWO = sampleWithRequiredData;
        const historiqueStatutWOCollection: IHistoriqueStatutWO[] = [sampleWithPartialData];
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing(historiqueStatutWOCollection, historiqueStatutWO);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(historiqueStatutWO);
      });

      it('should add only unique HistoriqueStatutWO to an array', () => {
        const historiqueStatutWOArray: IHistoriqueStatutWO[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const historiqueStatutWOCollection: IHistoriqueStatutWO[] = [sampleWithRequiredData];
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing(historiqueStatutWOCollection, ...historiqueStatutWOArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const historiqueStatutWO: IHistoriqueStatutWO = sampleWithRequiredData;
        const historiqueStatutWO2: IHistoriqueStatutWO = sampleWithPartialData;
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing([], historiqueStatutWO, historiqueStatutWO2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(historiqueStatutWO);
        expect(expectedResult).toContain(historiqueStatutWO2);
      });

      it('should accept null and undefined values', () => {
        const historiqueStatutWO: IHistoriqueStatutWO = sampleWithRequiredData;
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing([], null, historiqueStatutWO, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(historiqueStatutWO);
      });

      it('should return initial array if no HistoriqueStatutWO is added', () => {
        const historiqueStatutWOCollection: IHistoriqueStatutWO[] = [sampleWithRequiredData];
        expectedResult = service.addHistoriqueStatutWOToCollectionIfMissing(historiqueStatutWOCollection, undefined, null);
        expect(expectedResult).toEqual(historiqueStatutWOCollection);
      });
    });

    describe('compareHistoriqueStatutWO', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareHistoriqueStatutWO(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareHistoriqueStatutWO(entity1, entity2);
        const compareResult2 = service.compareHistoriqueStatutWO(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareHistoriqueStatutWO(entity1, entity2);
        const compareResult2 = service.compareHistoriqueStatutWO(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareHistoriqueStatutWO(entity1, entity2);
        const compareResult2 = service.compareHistoriqueStatutWO(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
