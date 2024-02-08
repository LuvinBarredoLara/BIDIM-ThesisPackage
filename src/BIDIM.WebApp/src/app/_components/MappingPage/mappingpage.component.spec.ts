import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingpageComponent } from './mappingpage.component';

describe('MappingpageComponent', () => {
  let component: MappingpageComponent;
  let fixture: ComponentFixture<MappingpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
