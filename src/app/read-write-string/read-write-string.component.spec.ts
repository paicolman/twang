import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadWriteStringComponent } from './read-write-string.component';

describe('ReadWriteStringComponent', () => {
  let component: ReadWriteStringComponent;
  let fixture: ComponentFixture<ReadWriteStringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadWriteStringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadWriteStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
