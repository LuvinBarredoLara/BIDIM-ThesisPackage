import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualModalComponent } from './individualmodal.component';

describe('IndividualmodalComponent', () => {
  let component: IndividualModalComponent;
  let fixture: ComponentFixture<IndividualModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
