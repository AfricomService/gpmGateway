import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSelectorModalComponent } from './site-selector-modal.component';

describe('SiteSelectorModalComponent', () => {
  let component: SiteSelectorModalComponent;
  let fixture: ComponentFixture<SiteSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
