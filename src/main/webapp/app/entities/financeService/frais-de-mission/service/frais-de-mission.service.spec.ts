import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IFraisDeMission } from '../frais-de-mission.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../frais-de-mission.test-samples';

import { FraisDeMissionService, RestFraisDeMission } from './frais-de-mission.service';

const requireRestSample: RestFraisDeMission = {
  ...sampleWithRequiredData,
  dateDebut: sampleWithRequiredData.dateDebut?.format(DATE_FORMAT),
  dateFin: sampleWithRequiredData.dateFin?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('FraisDeMission Service', () => {
  let service: FraisDeMissionService;
  let httpMock: HttpTestingController;
  let expectedResult: IFraisDeMission | IFraisDeMission[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(FraisDeMissionService);
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

    it('should create a FraisDeMission', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const fraisDeMission = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(fraisDeMission).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a FraisDeMission', () => {
      const fraisDeMission = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(fraisDeMission).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a FraisDeMission', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of FraisDeMission', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a FraisDeMission', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFraisDeMissionToCollectionIfMissing', () => {
      it('should add a FraisDeMission to an empty array', () => {
        const fraisDeMission: IFraisDeMission = sampleWithRequiredData;
        expectedResult = service.addFraisDeMissionToCollectionIfMissing([], fraisDeMission);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(fraisDeMission);
      });

      it('should not add a FraisDeMission to an array that contains it', () => {
        const fraisDeMission: IFraisDeMission = sampleWithRequiredData;
        const fraisDeMissionCollection: IFraisDeMission[] = [
          {
            ...fraisDeMission,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFraisDeMissionToCollectionIfMissing(fraisDeMissionCollection, fraisDeMission);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a FraisDeMission to an array that doesn't contain it", () => {
        const fraisDeMission: IFraisDeMission = sampleWithRequiredData;
        const fraisDeMissionCollection: IFraisDeMission[] = [sampleWithPartialData];
        expectedResult = service.addFraisDeMissionToCollectionIfMissing(fraisDeMissionCollection, fraisDeMission);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(fraisDeMission);
      });

      it('should add only unique FraisDeMission to an array', () => {
        const fraisDeMissionArray: IFraisDeMission[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const fraisDeMissionCollection: IFraisDeMission[] = [sampleWithRequiredData];
        expectedResult = service.addFraisDeMissionToCollectionIfMissing(fraisDeMissionCollection, ...fraisDeMissionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const fraisDeMission: IFraisDeMission = sampleWithRequiredData;
        const fraisDeMission2: IFraisDeMission = sampleWithPartialData;
        expectedResult = service.addFraisDeMissionToCollectionIfMissing([], fraisDeMission, fraisDeMission2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(fraisDeMission);
        expect(expectedResult).toContain(fraisDeMission2);
      });

      it('should accept null and undefined values', () => {
        const fraisDeMission: IFraisDeMission = sampleWithRequiredData;
        expectedResult = service.addFraisDeMissionToCollectionIfMissing([], null, fraisDeMission, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(fraisDeMission);
      });

      it('should return initial array if no FraisDeMission is added', () => {
        const fraisDeMissionCollection: IFraisDeMission[] = [sampleWithRequiredData];
        expectedResult = service.addFraisDeMissionToCollectionIfMissing(fraisDeMissionCollection, undefined, null);
        expect(expectedResult).toEqual(fraisDeMissionCollection);
      });
    });

    describe('compareFraisDeMission', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFraisDeMission(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareFraisDeMission(entity1, entity2);
        const compareResult2 = service.compareFraisDeMission(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareFraisDeMission(entity1, entity2);
        const compareResult2 = service.compareFraisDeMission(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareFraisDeMission(entity1, entity2);
        const compareResult2 = service.compareFraisDeMission(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
