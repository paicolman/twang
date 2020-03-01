import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadWriteArraysComponent } from './read-write-arrays.component';

describe('ReadWriteArraysComponent', () => {
  let component: ReadWriteArraysComponent;
  let fixture: ComponentFixture<ReadWriteArraysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadWriteArraysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadWriteArraysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
