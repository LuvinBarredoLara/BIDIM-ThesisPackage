import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseholdmodalComponent } from './householdmodal.component';

describe('HouseholdmodalComponent', () => {
  let component: HouseholdmodalComponent;
  let fixture: ComponentFixture<HouseholdmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HouseholdmodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HouseholdmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
