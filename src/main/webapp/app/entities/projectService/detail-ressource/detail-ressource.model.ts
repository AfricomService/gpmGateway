export interface IDetailRessourceOption {
  value?: string | null;
}

export interface IDetailRessource {
  id: number;
  status?: boolean | null;
  label?: string | null;
  code?: string | null;
  required?: boolean | null;
  inputType?: string | null;
  multipleChoiceOption?: IDetailRessourceOption[] | null;
}

export type NewDetailRessource = Omit<IDetailRessource, 'id'> & { id: null };
