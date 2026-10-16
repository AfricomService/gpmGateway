import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWorkOrder } from '../work-order.model';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';
import { StatusStep } from 'app/shared/status-stepper/status-stepper.component';
import { StatusStepperService } from 'app/shared/status-stepper/status-stepper.service';

@Component({
  selector: 'jhi-work-order-detail',
  templateUrl: './work-order-detail.component.html',
})
export class WorkOrderDetailComponent implements OnInit, OnDestroy {
  workOrder: IWorkOrder | null = null;

  // Cycle de vie affiché dans le stepper (ordre = ordre du workflow)
  readonly statutSteps: StatusStep[] = [
    { key: StatutWO.Creation, label: 'Création' },
    { key: StatutWO.ExecutionTravaux, label: 'Exécution travaux' },
    { key: StatutWO.VerificationWO, label: 'Vérification WO' },
    { key: StatutWO.ValidationTechnique, label: 'Validation technique' },
    { key: StatutWO.ValidationRessources, label: 'Validation ressources' },
    { key: StatutWO.Fin, label: 'Fin' },
  ];

  get currentStatut(): string {
    return (this.workOrder?.statut as string | null | undefined) ?? StatutWO.Creation;
  }

  constructor(protected activatedRoute: ActivatedRoute, protected stepperService: StatusStepperService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ workOrder }) => {
      this.workOrder = workOrder;
      if (workOrder) {
        this.stepperService.show(this.statutSteps, this.currentStatut);
      }
    });
  }

  ngOnDestroy(): void {
    this.stepperService.clear();
  }

  previousState(): void {
    window.history.back();
  }
}
