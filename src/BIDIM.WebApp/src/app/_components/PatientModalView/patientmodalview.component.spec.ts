import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientmodalviewComponent } from './patientmodalview.component';

describe('PatientmodalviewComponent', () => {
  let component: PatientmodalviewComponent;
  let fixture: ComponentFixture<PatientmodalviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientmodalviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientmodalviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
