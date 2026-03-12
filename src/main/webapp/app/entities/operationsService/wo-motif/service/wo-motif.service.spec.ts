import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IWoMotif } from '../wo-motif.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../wo-motif.test-samples';

import { WoMotifService } from './wo-motif.service';

const requireRestSample: IWoMotif = {
  ...sampleWithRequiredData,
};

describe('WoMotif Service', () => {
  let service: WoMotifService;
  let httpMock: HttpTestingController;
  let expectedResult: IWoMotif | IWoMotif[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(WoMotifService);
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

    it('should create a WoMotif', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const woMotif = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(woMotif).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a WoMotif', () => {
      const woMotif = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(woMotif).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a WoMotif', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of WoMotif', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a WoMotif', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addWoMotifToCollectionIfMissing', () => {
      it('should add a WoMotif to an empty array', () => {
        const woMotif: IWoMotif = sampleWithRequiredData;
        expectedResult = service.addWoMotifToCollectionIfMissing([], woMotif);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(woMotif);
      });

      it('should not add a WoMotif to an array that contains it', () => {
        const woMotif: IWoMotif = sampleWithRequiredData;
        const woMotifCollection: IWoMotif[] = [
          {
            ...woMotif,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addWoMotifToCollectionIfMissing(woMotifCollection, woMotif);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a WoMotif to an array that doesn't contain it", () => {
        const woMotif: IWoMotif = sampleWithRequiredData;
        const woMotifCollection: IWoMotif[] = [sampleWithPartialData];
        expectedResult = service.addWoMotifToCollectionIfMissing(woMotifCollection, woMotif);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(woMotif);
      });

      it('should add only unique WoMotif to an array', () => {
        const woMotifArray: IWoMotif[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const woMotifCollection: IWoMotif[] = [sampleWithRequiredData];
        expectedResult = service.addWoMotifToCollectionIfMissing(woMotifCollection, ...woMotifArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const woMotif: IWoMotif = sampleWithRequiredData;
        const woMotif2: IWoMotif = sampleWithPartialData;
        expectedResult = service.addWoMotifToCollectionIfMissing([], woMotif, woMotif2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(woMotif);
        expect(expectedResult).toContain(woMotif2);
      });

      it('should accept null and undefined values', () => {
        const woMotif: IWoMotif = sampleWithRequiredData;
        expectedResult = service.addWoMotifToCollectionIfMissing([], null, woMotif, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(woMotif);
      });

      it('should return initial array if no WoMotif is added', () => {
        const woMotifCollection: IWoMotif[] = [sampleWithRequiredData];
        expectedResult = service.addWoMotifToCollectionIfMissing(woMotifCollection, undefined, null);
        expect(expectedResult).toEqual(woMotifCollection);
      });
    });

    describe('compareWoMotif', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareWoMotif(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareWoMotif(entity1, entity2);
        const compareResult2 = service.compareWoMotif(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareWoMotif(entity1, entity2);
        const compareResult2 = service.compareWoMotif(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareWoMotif(entity1, entity2);
        const compareResult2 = service.compareWoMotif(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
