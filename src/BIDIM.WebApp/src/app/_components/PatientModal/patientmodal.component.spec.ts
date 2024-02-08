import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientmodalComponent } from './patientmodal.component';

describe('PatientmodalComponent', () => {
  let component: PatientmodalComponent;
  let fixture: ComponentFixture<PatientmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientmodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
