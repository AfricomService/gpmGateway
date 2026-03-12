import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ISST } from '../sst.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../sst.test-samples';

import { SSTService, RestSST } from './sst.service';

const requireRestSample: RestSST = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('SST Service', () => {
  let service: SSTService;
  let httpMock: HttpTestingController;
  let expectedResult: ISST | ISST[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(SSTService);
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

    it('should create a SST', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sST = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(sST).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SST', () => {
      const sST = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(sST).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SST', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SST', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SST', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSSTToCollectionIfMissing', () => {
      it('should add a SST to an empty array', () => {
        const sST: ISST = sampleWithRequiredData;
        expectedResult = service.addSSTToCollectionIfMissing([], sST);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(sST);
      });

      it('should not add a SST to an array that contains it', () => {
        const sST: ISST = sampleWithRequiredData;
        const sSTCollection: ISST[] = [
          {
            ...sST,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSSTToCollectionIfMissing(sSTCollection, sST);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SST to an array that doesn't contain it", () => {
        const sST: ISST = sampleWithRequiredData;
        const sSTCollection: ISST[] = [sampleWithPartialData];
        expectedResult = service.addSSTToCollectionIfMissing(sSTCollection, sST);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(sST);
      });

      it('should add only unique SST to an array', () => {
        const sSTArray: ISST[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const sSTCollection: ISST[] = [sampleWithRequiredData];
        expectedResult = service.addSSTToCollectionIfMissing(sSTCollection, ...sSTArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const sST: ISST = sampleWithRequiredData;
        const sST2: ISST = sampleWithPartialData;
        expectedResult = service.addSSTToCollectionIfMissing([], sST, sST2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(sST);
        expect(expectedResult).toContain(sST2);
      });

      it('should accept null and undefined values', () => {
        const sST: ISST = sampleWithRequiredData;
        expectedResult = service.addSSTToCollectionIfMissing([], null, sST, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(sST);
      });

      it('should return initial array if no SST is added', () => {
        const sSTCollection: ISST[] = [sampleWithRequiredData];
        expectedResult = service.addSSTToCollectionIfMissing(sSTCollection, undefined, null);
        expect(expectedResult).toEqual(sSTCollection);
      });
    });

    describe('compareSST', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSST(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareSST(entity1, entity2);
        const compareResult2 = service.compareSST(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareSST(entity1, entity2);
        const compareResult2 = service.compareSST(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareSST(entity1, entity2);
        const compareResult2 = service.compareSST(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
