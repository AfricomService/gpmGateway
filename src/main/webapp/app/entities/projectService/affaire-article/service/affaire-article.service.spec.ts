import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IAffaireArticle } from '../affaire-article.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../affaire-article.test-samples';

import { AffaireArticleService } from './affaire-article.service';

const requireRestSample: IAffaireArticle = {
  ...sampleWithRequiredData,
};

describe('AffaireArticle Service', () => {
  let service: AffaireArticleService;
  let httpMock: HttpTestingController;
  let expectedResult: IAffaireArticle | IAffaireArticle[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(AffaireArticleService);
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

    it('should create a AffaireArticle', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const affaireArticle = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(affaireArticle).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AffaireArticle', () => {
      const affaireArticle = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(affaireArticle).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AffaireArticle', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AffaireArticle', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AffaireArticle', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addAffaireArticleToCollectionIfMissing', () => {
      it('should add a AffaireArticle to an empty array', () => {
        const affaireArticle: IAffaireArticle = sampleWithRequiredData;
        expectedResult = service.addAffaireArticleToCollectionIfMissing([], affaireArticle);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(affaireArticle);
      });

      it('should not add a AffaireArticle to an array that contains it', () => {
        const affaireArticle: IAffaireArticle = sampleWithRequiredData;
        const affaireArticleCollection: IAffaireArticle[] = [
          {
            ...affaireArticle,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAffaireArticleToCollectionIfMissing(affaireArticleCollection, affaireArticle);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AffaireArticle to an array that doesn't contain it", () => {
        const affaireArticle: IAffaireArticle = sampleWithRequiredData;
        const affaireArticleCollection: IAffaireArticle[] = [sampleWithPartialData];
        expectedResult = service.addAffaireArticleToCollectionIfMissing(affaireArticleCollection, affaireArticle);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(affaireArticle);
      });

      it('should add only unique AffaireArticle to an array', () => {
        const affaireArticleArray: IAffaireArticle[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const affaireArticleCollection: IAffaireArticle[] = [sampleWithRequiredData];
        expectedResult = service.addAffaireArticleToCollectionIfMissing(affaireArticleCollection, ...affaireArticleArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const affaireArticle: IAffaireArticle = sampleWithRequiredData;
        const affaireArticle2: IAffaireArticle = sampleWithPartialData;
        expectedResult = service.addAffaireArticleToCollectionIfMissing([], affaireArticle, affaireArticle2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(affaireArticle);
        expect(expectedResult).toContain(affaireArticle2);
      });

      it('should accept null and undefined values', () => {
        const affaireArticle: IAffaireArticle = sampleWithRequiredData;
        expectedResult = service.addAffaireArticleToCollectionIfMissing([], null, affaireArticle, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(affaireArticle);
      });

      it('should return initial array if no AffaireArticle is added', () => {
        const affaireArticleCollection: IAffaireArticle[] = [sampleWithRequiredData];
        expectedResult = service.addAffaireArticleToCollectionIfMissing(affaireArticleCollection, undefined, null);
        expect(expectedResult).toEqual(affaireArticleCollection);
      });
    });

    describe('compareAffaireArticle', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAffaireArticle(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareAffaireArticle(entity1, entity2);
        const compareResult2 = service.compareAffaireArticle(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareAffaireArticle(entity1, entity2);
        const compareResult2 = service.compareAffaireArticle(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareAffaireArticle(entity1, entity2);
        const compareResult2 = service.compareAffaireArticle(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
