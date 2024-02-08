import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseholdModalViewComponent } from './householdmodalview.component';

describe('HouseholdmodalviewComponent', () => {
  let component: HouseholdModalViewComponent;
  let fixture: ComponentFixture<HouseholdModalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HouseholdModalViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HouseholdModalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
