import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IArticleDemandeAchat } from '../article-demande-achat.model';
import {
  sampleWithRequiredData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithFullData,
} from '../article-demande-achat.test-samples';

import { ArticleDemandeAchatService } from './article-demande-achat.service';

const requireRestSample: IArticleDemandeAchat = {
  ...sampleWithRequiredData,
};

describe('ArticleDemandeAchat Service', () => {
  let service: ArticleDemandeAchatService;
  let httpMock: HttpTestingController;
  let expectedResult: IArticleDemandeAchat | IArticleDemandeAchat[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ArticleDemandeAchatService);
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

    it('should create a ArticleDemandeAchat', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const articleDemandeAchat = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(articleDemandeAchat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ArticleDemandeAchat', () => {
      const articleDemandeAchat = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(articleDemandeAchat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ArticleDemandeAchat', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ArticleDemandeAchat', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ArticleDemandeAchat', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addArticleDemandeAchatToCollectionIfMissing', () => {
      it('should add a ArticleDemandeAchat to an empty array', () => {
        const articleDemandeAchat: IArticleDemandeAchat = sampleWithRequiredData;
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing([], articleDemandeAchat);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(articleDemandeAchat);
      });

      it('should not add a ArticleDemandeAchat to an array that contains it', () => {
        const articleDemandeAchat: IArticleDemandeAchat = sampleWithRequiredData;
        const articleDemandeAchatCollection: IArticleDemandeAchat[] = [
          {
            ...articleDemandeAchat,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing(articleDemandeAchatCollection, articleDemandeAchat);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ArticleDemandeAchat to an array that doesn't contain it", () => {
        const articleDemandeAchat: IArticleDemandeAchat = sampleWithRequiredData;
        const articleDemandeAchatCollection: IArticleDemandeAchat[] = [sampleWithPartialData];
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing(articleDemandeAchatCollection, articleDemandeAchat);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(articleDemandeAchat);
      });

      it('should add only unique ArticleDemandeAchat to an array', () => {
        const articleDemandeAchatArray: IArticleDemandeAchat[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const articleDemandeAchatCollection: IArticleDemandeAchat[] = [sampleWithRequiredData];
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing(articleDemandeAchatCollection, ...articleDemandeAchatArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const articleDemandeAchat: IArticleDemandeAchat = sampleWithRequiredData;
        const articleDemandeAchat2: IArticleDemandeAchat = sampleWithPartialData;
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing([], articleDemandeAchat, articleDemandeAchat2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(articleDemandeAchat);
        expect(expectedResult).toContain(articleDemandeAchat2);
      });

      it('should accept null and undefined values', () => {
        const articleDemandeAchat: IArticleDemandeAchat = sampleWithRequiredData;
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing([], null, articleDemandeAchat, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(articleDemandeAchat);
      });

      it('should return initial array if no ArticleDemandeAchat is added', () => {
        const articleDemandeAchatCollection: IArticleDemandeAchat[] = [sampleWithRequiredData];
        expectedResult = service.addArticleDemandeAchatToCollectionIfMissing(articleDemandeAchatCollection, undefined, null);
        expect(expectedResult).toEqual(articleDemandeAchatCollection);
      });
    });

    describe('compareArticleDemandeAchat', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareArticleDemandeAchat(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareArticleDemandeAchat(entity1, entity2);
        const compareResult2 = service.compareArticleDemandeAchat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareArticleDemandeAchat(entity1, entity2);
        const compareResult2 = service.compareArticleDemandeAchat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareArticleDemandeAchat(entity1, entity2);
        const compareResult2 = service.compareArticleDemandeAchat(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
