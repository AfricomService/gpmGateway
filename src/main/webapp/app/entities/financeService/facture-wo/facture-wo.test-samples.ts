import { IFactureWO, NewFactureWO } from './facture-wo.model';

export const sampleWithRequiredData: IFactureWO = {
  id: 677,
};

export const sampleWithPartialData: IFactureWO = {
  id: 72853,
  montantFacture: 10708,
  remarque: 'generate',
  workOrderId: 76934,
};

export const sampleWithFullData: IFactureWO = {
  id: 64375,
  pourcentageFacture: 25222,
  montantFacture: 16421,
  remarque: 'invoice groupware 5th',
  workOrderId: 3400,
};

export const sampleWithNewData: NewFactureWO = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
