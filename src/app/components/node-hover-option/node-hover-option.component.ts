import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HoverOptionOnDOM } from 'src/app/interfaces/HoverOptionOnDOM';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DOMBoundingBox } from 'src/app/interfaces/DOMBoundingBox';

@Component({
  selector: 'nodeHoverOption',
  templateUrl: './node-hover-option.component.html',
  styleUrls: ['./node-hover-option.component.scss']
})
export class NodeHoverOptionComponent implements OnInit {

  private nodeHoverSubscription: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.nodeHoverSubscription = fromEvent(document, 'mousemove').pipe(
      filter((pointer: MouseEvent) => {
        if (!(this.boundingBox.left <= pointer.clientX
          && pointer.clientX <= this.boundingBox.right 
          && this.boundingBox.bottom <= pointer.clientY
          && pointer.clientY <= this.boundingBox.top))
          return true;
      })
    ).subscribe(params => {
      this.onLeaveBoundingBox.emit();
    });
  }

  @Input() info: HoverOptionOnDOM;
  @Input() boundingBox: DOMBoundingBox;
  @Output() onOptionClicked: EventEmitter<any> = new EventEmitter();
  @Output() onLeaveBoundingBox: EventEmitter<any> = new EventEmitter();

  public optionWasClicked() {
    this.onOptionClicked.emit();
  }

}
