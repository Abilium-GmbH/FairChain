/*
* After consulatation with the Zühlke Firm, this component will not be tested.
* The work required to test it, is far to expensive. Instead a script
* of scenarios to be tested by hand is provided in the same folder.
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelabelPopUpComponent } from './relabel-pop-up.component';

describe('RelabelPopUpComponent', () => {
  let component: RelabelPopUpComponent;
  let fixture: ComponentFixture<RelabelPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelabelPopUpComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelabelPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});