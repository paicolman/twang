import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadWriteVariablesComponent } from './read-write-variables.component';

describe('ReadWriteVariablesComponent', () => {
  let component: ReadWriteVariablesComponent;
  let fixture: ComponentFixture<ReadWriteVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadWriteVariablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadWriteVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
