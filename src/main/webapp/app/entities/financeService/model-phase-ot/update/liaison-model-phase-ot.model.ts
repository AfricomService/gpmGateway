export interface ILiaisonModelPhaseOT {
  id: number;
  modelPhaseOtId?: number | null;
  phaseId?: number | null;
  classementPhase?: number | null;
}

export type NewLiaisonModelPhaseOT = Omit<ILiaisonModelPhaseOT, 'id'> & { id: null };
