import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RessourceSelectorModalComponent } from './ressource-selector-modal.component';

describe('RessourceSelectorModalComponent', () => {
  let component: RessourceSelectorModalComponent;
  let fixture: ComponentFixture<RessourceSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RessourceSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RessourceSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
