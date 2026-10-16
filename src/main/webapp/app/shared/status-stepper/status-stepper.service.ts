import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { StatusStep } from './status-stepper.component';

export interface StatusStepperState {
  steps: StatusStep[];
  current: string | null;
}

@Injectable({ providedIn: 'root' })
export class StatusStepperService {
  private readonly stateSubject = new BehaviorSubject<StatusStepperState | null>(null);
  readonly state$ = this.stateSubject.asObservable();

  show(steps: StatusStep[], current: string | null): void {
    this.stateSubject.next({ steps, current });
  }

  clear(): void {
    this.stateSubject.next(null);
  }
}
