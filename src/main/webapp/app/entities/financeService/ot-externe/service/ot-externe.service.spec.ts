import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IOtExterne } from '../ot-externe.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../ot-externe.test-samples';

import { OtExterneService, RestOtExterne } from './ot-externe.service';

const requireRestSample: RestOtExterne = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('OtExterne Service', () => {
  let service: OtExterneService;
  let httpMock: HttpTestingController;
  let expectedResult: IOtExterne | IOtExterne[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(OtExterneService);
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

    it('should create a OtExterne', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const otExterne = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(otExterne).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a OtExterne', () => {
      const otExterne = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(otExterne).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a OtExterne', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of OtExterne', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a OtExterne', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addOtExterneToCollectionIfMissing', () => {
      it('should add a OtExterne to an empty array', () => {
        const otExterne: IOtExterne = sampleWithRequiredData;
        expectedResult = service.addOtExterneToCollectionIfMissing([], otExterne);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(otExterne);
      });

      it('should not add a OtExterne to an array that contains it', () => {
        const otExterne: IOtExterne = sampleWithRequiredData;
        const otExterneCollection: IOtExterne[] = [
          {
            ...otExterne,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addOtExterneToCollectionIfMissing(otExterneCollection, otExterne);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a OtExterne to an array that doesn't contain it", () => {
        const otExterne: IOtExterne = sampleWithRequiredData;
        const otExterneCollection: IOtExterne[] = [sampleWithPartialData];
        expectedResult = service.addOtExterneToCollectionIfMissing(otExterneCollection, otExterne);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(otExterne);
      });

      it('should add only unique OtExterne to an array', () => {
        const otExterneArray: IOtExterne[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const otExterneCollection: IOtExterne[] = [sampleWithRequiredData];
        expectedResult = service.addOtExterneToCollectionIfMissing(otExterneCollection, ...otExterneArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const otExterne: IOtExterne = sampleWithRequiredData;
        const otExterne2: IOtExterne = sampleWithPartialData;
        expectedResult = service.addOtExterneToCollectionIfMissing([], otExterne, otExterne2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(otExterne);
        expect(expectedResult).toContain(otExterne2);
      });

      it('should accept null and undefined values', () => {
        const otExterne: IOtExterne = sampleWithRequiredData;
        expectedResult = service.addOtExterneToCollectionIfMissing([], null, otExterne, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(otExterne);
      });

      it('should return initial array if no OtExterne is added', () => {
        const otExterneCollection: IOtExterne[] = [sampleWithRequiredData];
        expectedResult = service.addOtExterneToCollectionIfMissing(otExterneCollection, undefined, null);
        expect(expectedResult).toEqual(otExterneCollection);
      });
    });

    describe('compareOtExterne', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareOtExterne(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareOtExterne(entity1, entity2);
        const compareResult2 = service.compareOtExterne(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareOtExterne(entity1, entity2);
        const compareResult2 = service.compareOtExterne(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareOtExterne(entity1, entity2);
        const compareResult2 = service.compareOtExterne(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
