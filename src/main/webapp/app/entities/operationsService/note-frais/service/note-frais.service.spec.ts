import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { INoteFrais } from '../note-frais.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../note-frais.test-samples';

import { NoteFraisService, RestNoteFrais } from './note-frais.service';

const requireRestSample: RestNoteFrais = {
  ...sampleWithRequiredData,
  dateDebut: sampleWithRequiredData.dateDebut?.toJSON(),
  dateFin: sampleWithRequiredData.dateFin?.toJSON(),
};

describe('NoteFrais Service', () => {
  let service: NoteFraisService;
  let httpMock: HttpTestingController;
  let expectedResult: INoteFrais | INoteFrais[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(NoteFraisService);
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

    it('should create a NoteFrais', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const noteFrais = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(noteFrais).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a NoteFrais', () => {
      const noteFrais = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(noteFrais).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a NoteFrais', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of NoteFrais', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a NoteFrais', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addNoteFraisToCollectionIfMissing', () => {
      it('should add a NoteFrais to an empty array', () => {
        const noteFrais: INoteFrais = sampleWithRequiredData;
        expectedResult = service.addNoteFraisToCollectionIfMissing([], noteFrais);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(noteFrais);
      });

      it('should not add a NoteFrais to an array that contains it', () => {
        const noteFrais: INoteFrais = sampleWithRequiredData;
        const noteFraisCollection: INoteFrais[] = [
          {
            ...noteFrais,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addNoteFraisToCollectionIfMissing(noteFraisCollection, noteFrais);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a NoteFrais to an array that doesn't contain it", () => {
        const noteFrais: INoteFrais = sampleWithRequiredData;
        const noteFraisCollection: INoteFrais[] = [sampleWithPartialData];
        expectedResult = service.addNoteFraisToCollectionIfMissing(noteFraisCollection, noteFrais);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(noteFrais);
      });

      it('should add only unique NoteFrais to an array', () => {
        const noteFraisArray: INoteFrais[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const noteFraisCollection: INoteFrais[] = [sampleWithRequiredData];
        expectedResult = service.addNoteFraisToCollectionIfMissing(noteFraisCollection, ...noteFraisArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const noteFrais: INoteFrais = sampleWithRequiredData;
        const noteFrais2: INoteFrais = sampleWithPartialData;
        expectedResult = service.addNoteFraisToCollectionIfMissing([], noteFrais, noteFrais2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(noteFrais);
        expect(expectedResult).toContain(noteFrais2);
      });

      it('should accept null and undefined values', () => {
        const noteFrais: INoteFrais = sampleWithRequiredData;
        expectedResult = service.addNoteFraisToCollectionIfMissing([], null, noteFrais, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(noteFrais);
      });

      it('should return initial array if no NoteFrais is added', () => {
        const noteFraisCollection: INoteFrais[] = [sampleWithRequiredData];
        expectedResult = service.addNoteFraisToCollectionIfMissing(noteFraisCollection, undefined, null);
        expect(expectedResult).toEqual(noteFraisCollection);
      });
    });

    describe('compareNoteFrais', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareNoteFrais(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareNoteFrais(entity1, entity2);
        const compareResult2 = service.compareNoteFrais(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareNoteFrais(entity1, entity2);
        const compareResult2 = service.compareNoteFrais(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareNoteFrais(entity1, entity2);
        const compareResult2 = service.compareNoteFrais(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
