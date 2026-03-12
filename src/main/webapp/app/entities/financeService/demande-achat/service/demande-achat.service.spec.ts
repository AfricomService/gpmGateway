import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IDemandeAchat } from '../demande-achat.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../demande-achat.test-samples';

import { DemandeAchatService, RestDemandeAchat } from './demande-achat.service';

const requireRestSample: RestDemandeAchat = {
  ...sampleWithRequiredData,
  dateCreation: sampleWithRequiredData.dateCreation?.toJSON(),
  dateMiseADisposition: sampleWithRequiredData.dateMiseADisposition?.format(DATE_FORMAT),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('DemandeAchat Service', () => {
  let service: DemandeAchatService;
  let httpMock: HttpTestingController;
  let expectedResult: IDemandeAchat | IDemandeAchat[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(DemandeAchatService);
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

    it('should create a DemandeAchat', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const demandeAchat = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(demandeAchat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a DemandeAchat', () => {
      const demandeAchat = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(demandeAchat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a DemandeAchat', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of DemandeAchat', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a DemandeAchat', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDemandeAchatToCollectionIfMissing', () => {
      it('should add a DemandeAchat to an empty array', () => {
        const demandeAchat: IDemandeAchat = sampleWithRequiredData;
        expectedResult = service.addDemandeAchatToCollectionIfMissing([], demandeAchat);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(demandeAchat);
      });

      it('should not add a DemandeAchat to an array that contains it', () => {
        const demandeAchat: IDemandeAchat = sampleWithRequiredData;
        const demandeAchatCollection: IDemandeAchat[] = [
          {
            ...demandeAchat,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDemandeAchatToCollectionIfMissing(demandeAchatCollection, demandeAchat);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a DemandeAchat to an array that doesn't contain it", () => {
        const demandeAchat: IDemandeAchat = sampleWithRequiredData;
        const demandeAchatCollection: IDemandeAchat[] = [sampleWithPartialData];
        expectedResult = service.addDemandeAchatToCollectionIfMissing(demandeAchatCollection, demandeAchat);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(demandeAchat);
      });

      it('should add only unique DemandeAchat to an array', () => {
        const demandeAchatArray: IDemandeAchat[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const demandeAchatCollection: IDemandeAchat[] = [sampleWithRequiredData];
        expectedResult = service.addDemandeAchatToCollectionIfMissing(demandeAchatCollection, ...demandeAchatArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const demandeAchat: IDemandeAchat = sampleWithRequiredData;
        const demandeAchat2: IDemandeAchat = sampleWithPartialData;
        expectedResult = service.addDemandeAchatToCollectionIfMissing([], demandeAchat, demandeAchat2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(demandeAchat);
        expect(expectedResult).toContain(demandeAchat2);
      });

      it('should accept null and undefined values', () => {
        const demandeAchat: IDemandeAchat = sampleWithRequiredData;
        expectedResult = service.addDemandeAchatToCollectionIfMissing([], null, demandeAchat, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(demandeAchat);
      });

      it('should return initial array if no DemandeAchat is added', () => {
        const demandeAchatCollection: IDemandeAchat[] = [sampleWithRequiredData];
        expectedResult = service.addDemandeAchatToCollectionIfMissing(demandeAchatCollection, undefined, null);
        expect(expectedResult).toEqual(demandeAchatCollection);
      });
    });

    describe('compareDemandeAchat', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDemandeAchat(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareDemandeAchat(entity1, entity2);
        const compareResult2 = service.compareDemandeAchat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareDemandeAchat(entity1, entity2);
        const compareResult2 = service.compareDemandeAchat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareDemandeAchat(entity1, entity2);
        const compareResult2 = service.compareDemandeAchat(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
