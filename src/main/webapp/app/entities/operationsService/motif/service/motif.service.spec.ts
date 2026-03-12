import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IMotif } from '../motif.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../motif.test-samples';

import { MotifService, RestMotif } from './motif.service';

const requireRestSample: RestMotif = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Motif Service', () => {
  let service: MotifService;
  let httpMock: HttpTestingController;
  let expectedResult: IMotif | IMotif[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(MotifService);
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

    it('should create a Motif', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const motif = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(motif).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Motif', () => {
      const motif = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(motif).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Motif', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Motif', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Motif', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addMotifToCollectionIfMissing', () => {
      it('should add a Motif to an empty array', () => {
        const motif: IMotif = sampleWithRequiredData;
        expectedResult = service.addMotifToCollectionIfMissing([], motif);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(motif);
      });

      it('should not add a Motif to an array that contains it', () => {
        const motif: IMotif = sampleWithRequiredData;
        const motifCollection: IMotif[] = [
          {
            ...motif,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addMotifToCollectionIfMissing(motifCollection, motif);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Motif to an array that doesn't contain it", () => {
        const motif: IMotif = sampleWithRequiredData;
        const motifCollection: IMotif[] = [sampleWithPartialData];
        expectedResult = service.addMotifToCollectionIfMissing(motifCollection, motif);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(motif);
      });

      it('should add only unique Motif to an array', () => {
        const motifArray: IMotif[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const motifCollection: IMotif[] = [sampleWithRequiredData];
        expectedResult = service.addMotifToCollectionIfMissing(motifCollection, ...motifArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const motif: IMotif = sampleWithRequiredData;
        const motif2: IMotif = sampleWithPartialData;
        expectedResult = service.addMotifToCollectionIfMissing([], motif, motif2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(motif);
        expect(expectedResult).toContain(motif2);
      });

      it('should accept null and undefined values', () => {
        const motif: IMotif = sampleWithRequiredData;
        expectedResult = service.addMotifToCollectionIfMissing([], null, motif, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(motif);
      });

      it('should return initial array if no Motif is added', () => {
        const motifCollection: IMotif[] = [sampleWithRequiredData];
        expectedResult = service.addMotifToCollectionIfMissing(motifCollection, undefined, null);
        expect(expectedResult).toEqual(motifCollection);
      });
    });

    describe('compareMotif', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareMotif(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareMotif(entity1, entity2);
        const compareResult2 = service.compareMotif(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareMotif(entity1, entity2);
        const compareResult2 = service.compareMotif(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareMotif(entity1, entity2);
        const compareResult2 = service.compareMotif(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
