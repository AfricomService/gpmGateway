import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleSelectorModalComponent } from './article-selector-modal.component';

describe('ArticleSelectorModalComponent', () => {
  let component: ArticleSelectorModalComponent;
  let fixture: ComponentFixture<ArticleSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArticleSelectorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
