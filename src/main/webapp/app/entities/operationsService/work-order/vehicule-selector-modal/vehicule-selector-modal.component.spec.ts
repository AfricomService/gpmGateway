import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeSelectorModalComponent } from './vehicule-selector-modal.component';

describe('VehiculeSelectorModalComponent', () => {
  let component: VehiculeSelectorModalComponent;
  let fixture: ComponentFixture<VehiculeSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehiculeSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiculeSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
