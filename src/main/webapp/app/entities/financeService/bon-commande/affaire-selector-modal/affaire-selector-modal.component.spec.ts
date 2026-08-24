import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffaireSelectorModalComponent } from './affaire-selector-modal.component';

describe('AffaireSelectorModalComponent', () => {
  let component: AffaireSelectorModalComponent;
  let fixture: ComponentFixture<AffaireSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AffaireSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AffaireSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
