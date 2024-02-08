import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseModalViewComponent } from './casemodalview.component';

describe('CasemodalviewComponent', () => {
  let component: CaseModalViewComponent;
  let fixture: ComponentFixture<CaseModalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseModalViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseModalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
