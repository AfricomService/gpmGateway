export interface IDetailRessource {
  id: number;
  status?: boolean | null;
  label?: string | null;
  code?: string | null;
  required?: boolean | null;
  inputType?: string | null;
  multipleChoiceOption?: string | null;
}

export type NewDetailRessource = Omit<IDetailRessource, 'id'> & { id: null };
