import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualModalViewComponent } from './individualmodalview.component';

describe('IndividualmodalviewComponent', () => {
  let component: IndividualModalViewComponent;
  let fixture: ComponentFixture<IndividualModalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualModalViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualModalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
