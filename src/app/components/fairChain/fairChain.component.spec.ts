import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FairChainComponent } from './fairChain.component';

describe('FairChainComponent', () => {
  let component: FairChainComponent;
  let fixture: ComponentFixture<FairChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FairChainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FairChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
