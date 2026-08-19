import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IDetailRessource } from '../detail-ressource.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../detail-ressource.test-samples';

import { DetailRessourceService } from './detail-ressource.service';

const requireRestSample: IDetailRessource = {
  ...sampleWithRequiredData,
};

describe('DetailRessource Service', () => {
  let service: DetailRessourceService;
  let httpMock: HttpTestingController;
  let expectedResult: IDetailRessource | IDetailRessource[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(DetailRessourceService);
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

    it('should create a DetailRessource', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const detailRessource = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(detailRessource).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a DetailRessource', () => {
      const detailRessource = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(detailRessource).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a DetailRessource', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of DetailRessource', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a DetailRessource', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDetailRessourceToCollectionIfMissing', () => {
      it('should add a DetailRessource to an empty array', () => {
        const detailRessource: IDetailRessource = sampleWithRequiredData;
        expectedResult = service.addDetailRessourceToCollectionIfMissing([], detailRessource);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(detailRessource);
      });

      it('should not add a DetailRessource to an array that contains it', () => {
        const detailRessource: IDetailRessource = sampleWithRequiredData;
        const detailRessourceCollection: IDetailRessource[] = [
          {
            ...detailRessource,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDetailRessourceToCollectionIfMissing(detailRessourceCollection, detailRessource);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a DetailRessource to an array that doesn't contain it", () => {
        const detailRessource: IDetailRessource = sampleWithRequiredData;
        const detailRessourceCollection: IDetailRessource[] = [sampleWithPartialData];
        expectedResult = service.addDetailRessourceToCollectionIfMissing(detailRessourceCollection, detailRessource);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(detailRessource);
      });

      it('should add only unique DetailRessource to an array', () => {
        const detailRessourceArray: IDetailRessource[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const detailRessourceCollection: IDetailRessource[] = [sampleWithRequiredData];
        expectedResult = service.addDetailRessourceToCollectionIfMissing(detailRessourceCollection, ...detailRessourceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const detailRessource: IDetailRessource = sampleWithRequiredData;
        const detailRessource2: IDetailRessource = sampleWithPartialData;
        expectedResult = service.addDetailRessourceToCollectionIfMissing([], detailRessource, detailRessource2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(detailRessource);
        expect(expectedResult).toContain(detailRessource2);
      });

      it('should accept null and undefined values', () => {
        const detailRessource: IDetailRessource = sampleWithRequiredData;
        expectedResult = service.addDetailRessourceToCollectionIfMissing([], null, detailRessource, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(detailRessource);
      });

      it('should return initial array if no DetailRessource is added', () => {
        const detailRessourceCollection: IDetailRessource[] = [sampleWithRequiredData];
        expectedResult = service.addDetailRessourceToCollectionIfMissing(detailRessourceCollection, undefined, null);
        expect(expectedResult).toEqual(detailRessourceCollection);
      });
    });

    describe('compareDetailRessource', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDetailRessource(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareDetailRessource(entity1, entity2);
        const compareResult2 = service.compareDetailRessource(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareDetailRessource(entity1, entity2);
        const compareResult2 = service.compareDetailRessource(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareDetailRessource(entity1, entity2);
        const compareResult2 = service.compareDetailRessource(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
