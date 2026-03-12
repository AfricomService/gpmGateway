import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IWoSite } from '../wo-site.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../wo-site.test-samples';

import { WoSiteService } from './wo-site.service';

const requireRestSample: IWoSite = {
  ...sampleWithRequiredData,
};

describe('WoSite Service', () => {
  let service: WoSiteService;
  let httpMock: HttpTestingController;
  let expectedResult: IWoSite | IWoSite[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(WoSiteService);
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

    it('should create a WoSite', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const woSite = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(woSite).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a WoSite', () => {
      const woSite = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(woSite).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a WoSite', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of WoSite', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a WoSite', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addWoSiteToCollectionIfMissing', () => {
      it('should add a WoSite to an empty array', () => {
        const woSite: IWoSite = sampleWithRequiredData;
        expectedResult = service.addWoSiteToCollectionIfMissing([], woSite);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(woSite);
      });

      it('should not add a WoSite to an array that contains it', () => {
        const woSite: IWoSite = sampleWithRequiredData;
        const woSiteCollection: IWoSite[] = [
          {
            ...woSite,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addWoSiteToCollectionIfMissing(woSiteCollection, woSite);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a WoSite to an array that doesn't contain it", () => {
        const woSite: IWoSite = sampleWithRequiredData;
        const woSiteCollection: IWoSite[] = [sampleWithPartialData];
        expectedResult = service.addWoSiteToCollectionIfMissing(woSiteCollection, woSite);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(woSite);
      });

      it('should add only unique WoSite to an array', () => {
        const woSiteArray: IWoSite[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const woSiteCollection: IWoSite[] = [sampleWithRequiredData];
        expectedResult = service.addWoSiteToCollectionIfMissing(woSiteCollection, ...woSiteArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const woSite: IWoSite = sampleWithRequiredData;
        const woSite2: IWoSite = sampleWithPartialData;
        expectedResult = service.addWoSiteToCollectionIfMissing([], woSite, woSite2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(woSite);
        expect(expectedResult).toContain(woSite2);
      });

      it('should accept null and undefined values', () => {
        const woSite: IWoSite = sampleWithRequiredData;
        expectedResult = service.addWoSiteToCollectionIfMissing([], null, woSite, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(woSite);
      });

      it('should return initial array if no WoSite is added', () => {
        const woSiteCollection: IWoSite[] = [sampleWithRequiredData];
        expectedResult = service.addWoSiteToCollectionIfMissing(woSiteCollection, undefined, null);
        expect(expectedResult).toEqual(woSiteCollection);
      });
    });

    describe('compareWoSite', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareWoSite(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareWoSite(entity1, entity2);
        const compareResult2 = service.compareWoSite(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareWoSite(entity1, entity2);
        const compareResult2 = service.compareWoSite(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareWoSite(entity1, entity2);
        const compareResult2 = service.compareWoSite(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
