import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IDemandeEspece } from '../demande-espece.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../demande-espece.test-samples';

import { DemandeEspeceService, RestDemandeEspece } from './demande-espece.service';

const requireRestSample: RestDemandeEspece = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('DemandeEspece Service', () => {
  let service: DemandeEspeceService;
  let httpMock: HttpTestingController;
  let expectedResult: IDemandeEspece | IDemandeEspece[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(DemandeEspeceService);
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

    it('should create a DemandeEspece', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const demandeEspece = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(demandeEspece).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a DemandeEspece', () => {
      const demandeEspece = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(demandeEspece).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a DemandeEspece', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of DemandeEspece', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a DemandeEspece', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDemandeEspeceToCollectionIfMissing', () => {
      it('should add a DemandeEspece to an empty array', () => {
        const demandeEspece: IDemandeEspece = sampleWithRequiredData;
        expectedResult = service.addDemandeEspeceToCollectionIfMissing([], demandeEspece);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(demandeEspece);
      });

      it('should not add a DemandeEspece to an array that contains it', () => {
        const demandeEspece: IDemandeEspece = sampleWithRequiredData;
        const demandeEspeceCollection: IDemandeEspece[] = [
          {
            ...demandeEspece,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDemandeEspeceToCollectionIfMissing(demandeEspeceCollection, demandeEspece);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a DemandeEspece to an array that doesn't contain it", () => {
        const demandeEspece: IDemandeEspece = sampleWithRequiredData;
        const demandeEspeceCollection: IDemandeEspece[] = [sampleWithPartialData];
        expectedResult = service.addDemandeEspeceToCollectionIfMissing(demandeEspeceCollection, demandeEspece);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(demandeEspece);
      });

      it('should add only unique DemandeEspece to an array', () => {
        const demandeEspeceArray: IDemandeEspece[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const demandeEspeceCollection: IDemandeEspece[] = [sampleWithRequiredData];
        expectedResult = service.addDemandeEspeceToCollectionIfMissing(demandeEspeceCollection, ...demandeEspeceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const demandeEspece: IDemandeEspece = sampleWithRequiredData;
        const demandeEspece2: IDemandeEspece = sampleWithPartialData;
        expectedResult = service.addDemandeEspeceToCollectionIfMissing([], demandeEspece, demandeEspece2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(demandeEspece);
        expect(expectedResult).toContain(demandeEspece2);
      });

      it('should accept null and undefined values', () => {
        const demandeEspece: IDemandeEspece = sampleWithRequiredData;
        expectedResult = service.addDemandeEspeceToCollectionIfMissing([], null, demandeEspece, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(demandeEspece);
      });

      it('should return initial array if no DemandeEspece is added', () => {
        const demandeEspeceCollection: IDemandeEspece[] = [sampleWithRequiredData];
        expectedResult = service.addDemandeEspeceToCollectionIfMissing(demandeEspeceCollection, undefined, null);
        expect(expectedResult).toEqual(demandeEspeceCollection);
      });
    });

    describe('compareDemandeEspece', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDemandeEspece(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareDemandeEspece(entity1, entity2);
        const compareResult2 = service.compareDemandeEspece(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareDemandeEspece(entity1, entity2);
        const compareResult2 = service.compareDemandeEspece(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareDemandeEspece(entity1, entity2);
        const compareResult2 = service.compareDemandeEspece(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
