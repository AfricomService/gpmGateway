import dayjs from 'dayjs/esm';

export interface IParametrageDeplacement {
  id: number;
  workOrderId?: number | null;
  date?: dayjs.Dayjs | null;
  params?: string | null;
}

export type NewParametrageDeplacement = Omit<IParametrageDeplacement, 'id'> & { id: null };
