import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IVehicule } from '../vehicule.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../vehicule.test-samples';

import { VehiculeService, RestVehicule } from './vehicule.service';

const requireRestSample: RestVehicule = {
  ...sampleWithRequiredData,
  dateCirculation: sampleWithRequiredData.dateCirculation?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Vehicule Service', () => {
  let service: VehiculeService;
  let httpMock: HttpTestingController;
  let expectedResult: IVehicule | IVehicule[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(VehiculeService);
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

    it('should create a Vehicule', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const vehicule = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(vehicule).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Vehicule', () => {
      const vehicule = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(vehicule).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Vehicule', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Vehicule', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Vehicule', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addVehiculeToCollectionIfMissing', () => {
      it('should add a Vehicule to an empty array', () => {
        const vehicule: IVehicule = sampleWithRequiredData;
        expectedResult = service.addVehiculeToCollectionIfMissing([], vehicule);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(vehicule);
      });

      it('should not add a Vehicule to an array that contains it', () => {
        const vehicule: IVehicule = sampleWithRequiredData;
        const vehiculeCollection: IVehicule[] = [
          {
            ...vehicule,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addVehiculeToCollectionIfMissing(vehiculeCollection, vehicule);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Vehicule to an array that doesn't contain it", () => {
        const vehicule: IVehicule = sampleWithRequiredData;
        const vehiculeCollection: IVehicule[] = [sampleWithPartialData];
        expectedResult = service.addVehiculeToCollectionIfMissing(vehiculeCollection, vehicule);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(vehicule);
      });

      it('should add only unique Vehicule to an array', () => {
        const vehiculeArray: IVehicule[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const vehiculeCollection: IVehicule[] = [sampleWithRequiredData];
        expectedResult = service.addVehiculeToCollectionIfMissing(vehiculeCollection, ...vehiculeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const vehicule: IVehicule = sampleWithRequiredData;
        const vehicule2: IVehicule = sampleWithPartialData;
        expectedResult = service.addVehiculeToCollectionIfMissing([], vehicule, vehicule2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(vehicule);
        expect(expectedResult).toContain(vehicule2);
      });

      it('should accept null and undefined values', () => {
        const vehicule: IVehicule = sampleWithRequiredData;
        expectedResult = service.addVehiculeToCollectionIfMissing([], null, vehicule, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(vehicule);
      });

      it('should return initial array if no Vehicule is added', () => {
        const vehiculeCollection: IVehicule[] = [sampleWithRequiredData];
        expectedResult = service.addVehiculeToCollectionIfMissing(vehiculeCollection, undefined, null);
        expect(expectedResult).toEqual(vehiculeCollection);
      });
    });

    describe('compareVehicule', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareVehicule(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareVehicule(entity1, entity2);
        const compareResult2 = service.compareVehicule(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareVehicule(entity1, entity2);
        const compareResult2 = service.compareVehicule(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareVehicule(entity1, entity2);
        const compareResult2 = service.compareVehicule(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
