import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonCommandeSelectorModalComponent } from './bon-commande-selector-modal.component';

describe('BonCommandeSelectorModalComponent', () => {
  let component: BonCommandeSelectorModalComponent;
  let fixture: ComponentFixture<BonCommandeSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BonCommandeSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BonCommandeSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
