import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
//import { strict as assert } from 'assert';
import { fromEvent, Subscription } from 'rxjs';
import { map, bufferCount, filter } from 'rxjs/operators';
import { RectOnDOM } from 'src/app/interfaces/RectOnDOM';

@Component({
  selector: 'relabel-pop-up',
  templateUrl: './relabel-pop-up.component.html',
  styleUrls: ['./relabel-pop-up.component.scss']
})
export class RelabelPopUpComponent implements OnInit {

  constructor() { }

  private subscriptions: Subscription;

  @Input() info: RectOnDOM;
  
  @Input()  label: string;
  @Output() labelChange = new EventEmitter<string>();
  @Output() closeRelabelPopUp = new EventEmitter();
  @ViewChild('relabelTextArea') relabelTextAreaRef: ElementRef;

  ngOnInit(): void {
    this.subscriptions = new Subscription();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      fromEvent(this.relabelTextAreaRef.nativeElement, 'click').pipe(
        map(() => new Date().getTime()),
        bufferCount(2, 1),
        filter((timestamps) => {
          return timestamps[0] > new Date().getTime() - 200;
        })
      ).subscribe(() => {
        this.isClosingPopUp();
      })
    )
  }

  public updateLabel() {
    this.labelChange.emit(this.convertToMultiline(this.label));
  }

  public isClosingPopUp() {
    this.closeRelabelPopUp.emit();
  }

  private convertToMultiline(text: string) {
    return text.replace('\n', '\n');
  }
  
}
