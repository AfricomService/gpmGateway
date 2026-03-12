import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IArticleMission } from '../article-mission.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../article-mission.test-samples';

import { ArticleMissionService } from './article-mission.service';

const requireRestSample: IArticleMission = {
  ...sampleWithRequiredData,
};

describe('ArticleMission Service', () => {
  let service: ArticleMissionService;
  let httpMock: HttpTestingController;
  let expectedResult: IArticleMission | IArticleMission[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ArticleMissionService);
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

    it('should create a ArticleMission', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const articleMission = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(articleMission).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ArticleMission', () => {
      const articleMission = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(articleMission).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ArticleMission', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ArticleMission', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ArticleMission', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addArticleMissionToCollectionIfMissing', () => {
      it('should add a ArticleMission to an empty array', () => {
        const articleMission: IArticleMission = sampleWithRequiredData;
        expectedResult = service.addArticleMissionToCollectionIfMissing([], articleMission);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(articleMission);
      });

      it('should not add a ArticleMission to an array that contains it', () => {
        const articleMission: IArticleMission = sampleWithRequiredData;
        const articleMissionCollection: IArticleMission[] = [
          {
            ...articleMission,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addArticleMissionToCollectionIfMissing(articleMissionCollection, articleMission);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ArticleMission to an array that doesn't contain it", () => {
        const articleMission: IArticleMission = sampleWithRequiredData;
        const articleMissionCollection: IArticleMission[] = [sampleWithPartialData];
        expectedResult = service.addArticleMissionToCollectionIfMissing(articleMissionCollection, articleMission);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(articleMission);
      });

      it('should add only unique ArticleMission to an array', () => {
        const articleMissionArray: IArticleMission[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const articleMissionCollection: IArticleMission[] = [sampleWithRequiredData];
        expectedResult = service.addArticleMissionToCollectionIfMissing(articleMissionCollection, ...articleMissionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const articleMission: IArticleMission = sampleWithRequiredData;
        const articleMission2: IArticleMission = sampleWithPartialData;
        expectedResult = service.addArticleMissionToCollectionIfMissing([], articleMission, articleMission2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(articleMission);
        expect(expectedResult).toContain(articleMission2);
      });

      it('should accept null and undefined values', () => {
        const articleMission: IArticleMission = sampleWithRequiredData;
        expectedResult = service.addArticleMissionToCollectionIfMissing([], null, articleMission, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(articleMission);
      });

      it('should return initial array if no ArticleMission is added', () => {
        const articleMissionCollection: IArticleMission[] = [sampleWithRequiredData];
        expectedResult = service.addArticleMissionToCollectionIfMissing(articleMissionCollection, undefined, null);
        expect(expectedResult).toEqual(articleMissionCollection);
      });
    });

    describe('compareArticleMission', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareArticleMission(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareArticleMission(entity1, entity2);
        const compareResult2 = service.compareArticleMission(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareArticleMission(entity1, entity2);
        const compareResult2 = service.compareArticleMission(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareArticleMission(entity1, entity2);
        const compareResult2 = service.compareArticleMission(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
