import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HoverOptionOnDOM } from 'src/app/interfaces/HoverOptionOnDOM';

@Component({
  selector: 'nodeHoverOption',
  templateUrl: './node-hover-option.component.html',
  styleUrls: ['./node-hover-option.component.scss']
})
export class NodeHoverOptionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() info: HoverOptionOnDOM;
  @Output() onOptionClicked: EventEmitter<any> = new EventEmitter();

  public optionWasClicked() {
    this.onOptionClicked.emit();
  }

}
