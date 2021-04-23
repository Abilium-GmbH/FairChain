import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { relabelPopUpInfo } from '../interfaces';

@Component({
  selector: 'relabel-pop-up',
  templateUrl: './relabel-pop-up.component.html',
  styleUrls: ['./relabel-pop-up.component.scss']
})
export class RelabelPopUpComponent implements OnInit {

  constructor() { }

  @Input() info: relabelPopUpInfo;
  
  @Input()  label: string;
  @Output() labelChange = new EventEmitter<string>();

  ngOnInit(): void {
  }

  public updateLabel($event) 
  {
    this.labelChange.emit($event.target.textContent);
  }

}
