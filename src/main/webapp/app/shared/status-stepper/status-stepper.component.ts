import { Component, Input } from '@angular/core';

export interface StatusStep {
  key: string;
  label: string;
}

type StepState = 'done' | 'active' | 'todo';

@Component({
  selector: 'jhi-status-stepper',
  templateUrl: './status-stepper.component.html',
  styleUrls: ['./status-stepper.component.scss'],
})
export class StatusStepperComponent {
  @Input() steps: StatusStep[] = [];
  @Input() current: string | null | undefined = null;

  get currentIndex(): number {
    return this.steps.findIndex(s => s.key === this.current);
  }

  stateOf(index: number): StepState {
    const current = this.currentIndex;
    const isLast = index === this.steps.length - 1;

    // Étape déjà passée, ou dernière étape atteinte (cycle terminé) -> validée
    if (index < current || (index === current && isLast)) {
      return 'done';
    }
    return index === current ? 'active' : 'todo';
  }

  trackByKey = (_index: number, step: StatusStep): string => step.key;
}
