export interface IMission {
  id: number;
  titreBeneficiaire?: string | null;
  noteMission?: number | null;
  contactSocieteId?: number | null;
  contactSocieteMatricule?: string | null;
  fraisJourFerie?: number | null;
  fraisJourWeekend?: number | null;
  fraisPersonnel?: number | null;
  montantTotale?: number | null;
  workorderId?: number | null;
  noteFraisId?: number | null;
}

export type NewMission = Omit<IMission, 'id'> & { id: null };

/** Ligne envoyée à POST /work-orders/{id}/start-execution (le titre MANAGER/TECHNIQUE est déduit par le backend). */
export interface IMissionLine {
  contactSocieteId: number;
  contactSocieteMatricule: string | null;
  noteMission: number;
}
