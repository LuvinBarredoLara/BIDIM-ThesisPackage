import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsermodalComponent } from './usermodal.component';

describe('UsermodalComponent', () => {
  let component: UsermodalComponent;
  let fixture: ComponentFixture<UsermodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsermodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsermodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
