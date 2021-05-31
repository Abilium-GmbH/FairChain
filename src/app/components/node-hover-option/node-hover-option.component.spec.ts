import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeHoverOptionComponent } from './node-hover-option.component';

describe('NodeHoverOptionComponent', () => {
  let component: NodeHoverOptionComponent;
  let fixture: ComponentFixture<NodeHoverOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeHoverOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeHoverOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
