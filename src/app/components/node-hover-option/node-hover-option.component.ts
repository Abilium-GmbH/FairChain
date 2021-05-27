import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HoverOptionOnDOM } from 'src/app/interfaces/HoverOptionOnDOM';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RectOnDOM } from 'src/app/interfaces/RectOnDOM';

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
        if (!(this.boundingBox.x <= pointer.clientX
          && pointer.clientX <= this.boundingBox.x + this.boundingBox.width
          && this.boundingBox.y <= pointer.clientY
          && pointer.clientY <= this.boundingBox.y + this.boundingBox.height))
          return true;
      })
    ).subscribe(params => {
      this.onLeaveBoundingBox.emit();
    });
  }

  @Input() info: HoverOptionOnDOM;
  @Input() boundingBox: RectOnDOM;
  @Input() img: string;
  @Output() onOptionClicked: EventEmitter<any> = new EventEmitter();
  @Output() onLeaveBoundingBox: EventEmitter<any> = new EventEmitter();

  public optionWasClicked() {
    this.onOptionClicked.emit();
  }

}
