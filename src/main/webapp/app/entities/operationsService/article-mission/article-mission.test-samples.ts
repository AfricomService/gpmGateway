import { IArticleMission, NewArticleMission } from './article-mission.model';

export const sampleWithRequiredData: IArticleMission = {
  id: 97902,
  item: 57816,
  quantitePlanifiee: 99391,
};

export const sampleWithPartialData: IArticleMission = {
  id: 783,
  item: 14094,
  quantitePlanifiee: 84976,
};

export const sampleWithFullData: IArticleMission = {
  id: 50806,
  item: 48441,
  quantitePlanifiee: 52592,
  quantiteRealisee: 85077,
  articleCode: 'Fresh',
};

export const sampleWithNewData: NewArticleMission = {
  item: 74715,
  quantitePlanifiee: 65307,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
