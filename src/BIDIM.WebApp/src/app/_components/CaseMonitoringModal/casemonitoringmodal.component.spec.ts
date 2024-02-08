import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasemonitoringmodalComponent } from './casemonitoringmodal.component';

describe('CasemonitoringmodalComponent', () => {
  let component: CasemonitoringmodalComponent;
  let fixture: ComponentFixture<CasemonitoringmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasemonitoringmodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasemonitoringmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
