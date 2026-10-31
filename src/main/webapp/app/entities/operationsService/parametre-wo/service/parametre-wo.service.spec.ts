import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IParametreWO } from '../parametre-wo.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../parametre-wo.test-samples';

import { ParametreWOService } from './parametre-wo.service';

const requireRestSample: IParametreWO = {
  ...sampleWithRequiredData,
};

describe('ParametreWO Service', () => {
  let service: ParametreWOService;
  let httpMock: HttpTestingController;
  let expectedResult: IParametreWO | IParametreWO[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ParametreWOService);
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

    it('should create a ParametreWO', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const parametreWO = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(parametreWO).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ParametreWO', () => {
      const parametreWO = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(parametreWO).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ParametreWO', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ParametreWO', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ParametreWO', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addParametreWOToCollectionIfMissing', () => {
      it('should add a ParametreWO to an empty array', () => {
        const parametreWO: IParametreWO = sampleWithRequiredData;
        expectedResult = service.addParametreWOToCollectionIfMissing([], parametreWO);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(parametreWO);
      });

      it('should not add a ParametreWO to an array that contains it', () => {
        const parametreWO: IParametreWO = sampleWithRequiredData;
        const parametreWOCollection: IParametreWO[] = [
          {
            ...parametreWO,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addParametreWOToCollectionIfMissing(parametreWOCollection, parametreWO);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ParametreWO to an array that doesn't contain it", () => {
        const parametreWO: IParametreWO = sampleWithRequiredData;
        const parametreWOCollection: IParametreWO[] = [sampleWithPartialData];
        expectedResult = service.addParametreWOToCollectionIfMissing(parametreWOCollection, parametreWO);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(parametreWO);
      });

      it('should add only unique ParametreWO to an array', () => {
        const parametreWOArray: IParametreWO[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const parametreWOCollection: IParametreWO[] = [sampleWithRequiredData];
        expectedResult = service.addParametreWOToCollectionIfMissing(parametreWOCollection, ...parametreWOArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const parametreWO: IParametreWO = sampleWithRequiredData;
        const parametreWO2: IParametreWO = sampleWithPartialData;
        expectedResult = service.addParametreWOToCollectionIfMissing([], parametreWO, parametreWO2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(parametreWO);
        expect(expectedResult).toContain(parametreWO2);
      });

      it('should accept null and undefined values', () => {
        const parametreWO: IParametreWO = sampleWithRequiredData;
        expectedResult = service.addParametreWOToCollectionIfMissing([], null, parametreWO, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(parametreWO);
      });

      it('should return initial array if no ParametreWO is added', () => {
        const parametreWOCollection: IParametreWO[] = [sampleWithRequiredData];
        expectedResult = service.addParametreWOToCollectionIfMissing(parametreWOCollection, undefined, null);
        expect(expectedResult).toEqual(parametreWOCollection);
      });
    });

    describe('compareParametreWO', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareParametreWO(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareParametreWO(entity1, entity2);
        const compareResult2 = service.compareParametreWO(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareParametreWO(entity1, entity2);
        const compareResult2 = service.compareParametreWO(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareParametreWO(entity1, entity2);
        const compareResult2 = service.compareParametreWO(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
