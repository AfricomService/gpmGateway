import { IWoSite, NewWoSite } from './wo-site.model';

export const sampleWithRequiredData: IWoSite = {
  id: 42650,
};

export const sampleWithPartialData: IWoSite = {
  id: 60089,
};

export const sampleWithFullData: IWoSite = {
  id: 82579,
  siteCode: 'plug-and-play Account',
};

export const sampleWithNewData: NewWoSite = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
