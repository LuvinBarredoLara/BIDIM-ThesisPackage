import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasemodalComponent } from './casemodal.component';

describe('CasemodalComponent', () => {
  let component: CasemodalComponent;
  let fixture: ComponentFixture<CasemodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasemodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasemodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
