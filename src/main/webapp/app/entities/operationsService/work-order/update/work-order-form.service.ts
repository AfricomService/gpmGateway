import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IWorkOrder, NewWorkOrder } from '../work-order.model';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IWorkOrder for edit and NewWorkOrderFormGroupInput for create.
 */
type WorkOrderFormGroupInput = IWorkOrder | PartialWithRequiredKeyOf<NewWorkOrder>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IWorkOrder | NewWorkOrder> = Omit<
  T,
  'dateHeureDebutPrev' | 'dateHeureFinPrev' | 'dateHeureDebutReel' | 'dateHeureFinReel'
> & {
  dateHeureDebutPrev?: string | null;
  dateHeureFinPrev?: string | null;
  dateHeureDebutReel?: string | null;
  dateHeureFinReel?: string | null;
};

type WorkOrderFormRawValue = FormValueOf<IWorkOrder>;

type NewWorkOrderFormRawValue = FormValueOf<NewWorkOrder>;

type WorkOrderFormDefaults = Pick<
  NewWorkOrder,
  'id' | 'dateHeureDebutPrev' | 'dateHeureFinPrev' | 'dateHeureDebutReel' | 'dateHeureFinReel' | 'missionDeNuit' | 'hebergement' | 'statut'
>;

type WorkOrderFormGroupContent = {
  id: FormControl<WorkOrderFormRawValue['id'] | NewWorkOrder['id']>;
  clientId: FormControl<WorkOrderFormRawValue['clientId']>;
  affaireId: FormControl<WorkOrderFormRawValue['affaireId']>;
  demandeurContactId: FormControl<WorkOrderFormRawValue['demandeurContactId']>;
  vehiculeId: FormControl<WorkOrderFormRawValue['vehiculeId']>;
  otExterneId: FormControl<WorkOrderFormRawValue['otExterneId']>;
  valideurId: FormControl<WorkOrderFormRawValue['valideurId']>;
  valideurUserLogin: FormControl<WorkOrderFormRawValue['valideurUserLogin']>;
  dateHeureDebutPrev: FormControl<WorkOrderFormRawValue['dateHeureDebutPrev']>;
  dateHeureFinPrev: FormControl<WorkOrderFormRawValue['dateHeureFinPrev']>;
  dateHeureDebutReel: FormControl<WorkOrderFormRawValue['dateHeureDebutReel']>;
  dateHeureFinReel: FormControl<WorkOrderFormRawValue['dateHeureFinReel']>;
  missionDeNuit: FormControl<WorkOrderFormRawValue['missionDeNuit']>;
  nombreNuits: FormControl<WorkOrderFormRawValue['nombreNuits']>;
  hebergement: FormControl<WorkOrderFormRawValue['hebergement']>;
  nombreHebergements: FormControl<WorkOrderFormRawValue['nombreHebergements']>;
  remarque: FormControl<WorkOrderFormRawValue['remarque']>;
  numFicheIntervention: FormControl<WorkOrderFormRawValue['numFicheIntervention']>;
  statut: FormControl<WorkOrderFormRawValue['statut']>;
  materielUtilise: FormControl<WorkOrderFormRawValue['materielUtilise']>;
  lieu: FormControl<WorkOrderFormRawValue['lieu']>;
  responsableId: FormControl<WorkOrderFormRawValue['responsableId']>;
  coordinateur: FormControl<WorkOrderFormRawValue['coordinateur']>;
};

export type WorkOrderFormGroup = FormGroup<WorkOrderFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WorkOrderFormService {
  createWorkOrderFormGroup(workOrder: WorkOrderFormGroupInput = { id: null }): WorkOrderFormGroup {
    const workOrderRawValue = this.convertWorkOrderToWorkOrderRawValue({
      ...this.getFormDefaults(),
      ...workOrder,
    });
    return new FormGroup<WorkOrderFormGroupContent>({
      id: new FormControl(
        { value: workOrderRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      clientId: new FormControl(workOrderRawValue.clientId),
      affaireId: new FormControl(workOrderRawValue.affaireId),
      demandeurContactId: new FormControl(workOrderRawValue.demandeurContactId),
      vehiculeId: new FormControl(workOrderRawValue.vehiculeId),
      otExterneId: new FormControl(workOrderRawValue.otExterneId),
      valideurId: new FormControl(workOrderRawValue.valideurId),
      valideurUserLogin: new FormControl(workOrderRawValue.valideurUserLogin),
      dateHeureDebutPrev: new FormControl(workOrderRawValue.dateHeureDebutPrev, {
        validators: [Validators.required],
      }),
      dateHeureFinPrev: new FormControl(workOrderRawValue.dateHeureFinPrev, {
        validators: [Validators.required],
      }),
      dateHeureDebutReel: new FormControl(workOrderRawValue.dateHeureDebutReel),
      dateHeureFinReel: new FormControl(workOrderRawValue.dateHeureFinReel),
      missionDeNuit: new FormControl(workOrderRawValue.missionDeNuit, {
        validators: [Validators.required],
      }),
      nombreNuits: new FormControl(workOrderRawValue.nombreNuits),
      hebergement: new FormControl(workOrderRawValue.hebergement, {
        validators: [Validators.required],
      }),
      nombreHebergements: new FormControl(workOrderRawValue.nombreHebergements),
      remarque: new FormControl(workOrderRawValue.remarque),
      numFicheIntervention: new FormControl(workOrderRawValue.numFicheIntervention),
      statut: new FormControl(workOrderRawValue.statut, {
        validators: [Validators.required],
      }),
      materielUtilise: new FormControl(workOrderRawValue.materielUtilise),
      lieu: new FormControl(workOrderRawValue.lieu),
      responsableId: new FormControl(workOrderRawValue.responsableId),
      coordinateur: new FormControl(workOrderRawValue.coordinateur),
    });
  }

  getWorkOrder(form: WorkOrderFormGroup): IWorkOrder | NewWorkOrder {
    return this.convertWorkOrderRawValueToWorkOrder(form.getRawValue() as WorkOrderFormRawValue | NewWorkOrderFormRawValue);
  }

  resetForm(form: WorkOrderFormGroup, workOrder: WorkOrderFormGroupInput): void {
    const workOrderRawValue = this.convertWorkOrderToWorkOrderRawValue({ ...this.getFormDefaults(), ...workOrder });
    form.reset(
      {
        ...workOrderRawValue,
        id: { value: workOrderRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): WorkOrderFormDefaults {
    const today = dayjs();

    // Heure de début par défaut : aujourd'hui 08:00 (modifiable par l'utilisateur)
    const debutDefault = today.hour(8).minute(0).second(0).millisecond(0);

    // Heure de fin par défaut : aujourd'hui 18:00 (modifiable par l'utilisateur)
    const finDefault = today.hour(18).minute(0).second(0).millisecond(0);

    return {
      id: null,
      dateHeureDebutPrev: debutDefault,
      dateHeureFinPrev: finDefault,
      dateHeureDebutReel: debutDefault,
      dateHeureFinReel: finDefault,
      missionDeNuit: false,
      hebergement: false,
      statut: StatutWO.Creation,
    };
  }

  private convertWorkOrderRawValueToWorkOrder(rawWorkOrder: WorkOrderFormRawValue | NewWorkOrderFormRawValue): IWorkOrder | NewWorkOrder {
    return {
      ...rawWorkOrder,
      dateHeureDebutPrev: dayjs(rawWorkOrder.dateHeureDebutPrev, DATE_TIME_FORMAT),
      dateHeureFinPrev: dayjs(rawWorkOrder.dateHeureFinPrev, DATE_TIME_FORMAT),
      dateHeureDebutReel: dayjs(rawWorkOrder.dateHeureDebutReel, DATE_TIME_FORMAT),
      dateHeureFinReel: dayjs(rawWorkOrder.dateHeureFinReel, DATE_TIME_FORMAT),
    };
  }

  private convertWorkOrderToWorkOrderRawValue(
    workOrder: IWorkOrder | (Partial<NewWorkOrder> & WorkOrderFormDefaults)
  ): WorkOrderFormRawValue | PartialWithRequiredKeyOf<NewWorkOrderFormRawValue> {
    return {
      ...workOrder,
      dateHeureDebutPrev: workOrder.dateHeureDebutPrev ? workOrder.dateHeureDebutPrev.format(DATE_TIME_FORMAT) : undefined,
      dateHeureFinPrev: workOrder.dateHeureFinPrev ? workOrder.dateHeureFinPrev.format(DATE_TIME_FORMAT) : undefined,
      dateHeureDebutReel: workOrder.dateHeureDebutReel ? workOrder.dateHeureDebutReel.format(DATE_TIME_FORMAT) : undefined,
      dateHeureFinReel: workOrder.dateHeureFinReel ? workOrder.dateHeureFinReel.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
