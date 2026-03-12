import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IPieceJointe } from '../piece-jointe.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../piece-jointe.test-samples';

import { PieceJointeService, RestPieceJointe } from './piece-jointe.service';

const requireRestSample: RestPieceJointe = {
  ...sampleWithRequiredData,
  dateUpload: sampleWithRequiredData.dateUpload?.toJSON(),
};

describe('PieceJointe Service', () => {
  let service: PieceJointeService;
  let httpMock: HttpTestingController;
  let expectedResult: IPieceJointe | IPieceJointe[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(PieceJointeService);
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

    it('should create a PieceJointe', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const pieceJointe = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(pieceJointe).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PieceJointe', () => {
      const pieceJointe = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(pieceJointe).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PieceJointe', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PieceJointe', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PieceJointe', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPieceJointeToCollectionIfMissing', () => {
      it('should add a PieceJointe to an empty array', () => {
        const pieceJointe: IPieceJointe = sampleWithRequiredData;
        expectedResult = service.addPieceJointeToCollectionIfMissing([], pieceJointe);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pieceJointe);
      });

      it('should not add a PieceJointe to an array that contains it', () => {
        const pieceJointe: IPieceJointe = sampleWithRequiredData;
        const pieceJointeCollection: IPieceJointe[] = [
          {
            ...pieceJointe,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPieceJointeToCollectionIfMissing(pieceJointeCollection, pieceJointe);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PieceJointe to an array that doesn't contain it", () => {
        const pieceJointe: IPieceJointe = sampleWithRequiredData;
        const pieceJointeCollection: IPieceJointe[] = [sampleWithPartialData];
        expectedResult = service.addPieceJointeToCollectionIfMissing(pieceJointeCollection, pieceJointe);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pieceJointe);
      });

      it('should add only unique PieceJointe to an array', () => {
        const pieceJointeArray: IPieceJointe[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const pieceJointeCollection: IPieceJointe[] = [sampleWithRequiredData];
        expectedResult = service.addPieceJointeToCollectionIfMissing(pieceJointeCollection, ...pieceJointeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const pieceJointe: IPieceJointe = sampleWithRequiredData;
        const pieceJointe2: IPieceJointe = sampleWithPartialData;
        expectedResult = service.addPieceJointeToCollectionIfMissing([], pieceJointe, pieceJointe2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pieceJointe);
        expect(expectedResult).toContain(pieceJointe2);
      });

      it('should accept null and undefined values', () => {
        const pieceJointe: IPieceJointe = sampleWithRequiredData;
        expectedResult = service.addPieceJointeToCollectionIfMissing([], null, pieceJointe, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pieceJointe);
      });

      it('should return initial array if no PieceJointe is added', () => {
        const pieceJointeCollection: IPieceJointe[] = [sampleWithRequiredData];
        expectedResult = service.addPieceJointeToCollectionIfMissing(pieceJointeCollection, undefined, null);
        expect(expectedResult).toEqual(pieceJointeCollection);
      });
    });

    describe('comparePieceJointe', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePieceJointe(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.comparePieceJointe(entity1, entity2);
        const compareResult2 = service.comparePieceJointe(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.comparePieceJointe(entity1, entity2);
        const compareResult2 = service.comparePieceJointe(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.comparePieceJointe(entity1, entity2);
        const compareResult2 = service.comparePieceJointe(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
