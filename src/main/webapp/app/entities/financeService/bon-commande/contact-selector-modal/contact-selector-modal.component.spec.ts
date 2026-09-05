import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSelectorModalComponent } from './contact-selector-modal.component';

describe('ContactSelectorModalComponent', () => {
  let component: ContactSelectorModalComponent;
  let fixture: ComponentFixture<ContactSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
