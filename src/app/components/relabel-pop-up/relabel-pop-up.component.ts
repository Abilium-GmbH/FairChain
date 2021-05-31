import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { map, bufferCount, filter } from 'rxjs/operators';
import { RectOnDOM } from 'src/app/interfaces/RectOnDOM';

@Component({
  selector: 'relabel-pop-up',
  templateUrl: './relabel-pop-up.component.html',
  styleUrls: ['./relabel-pop-up.component.scss']
})
export class RelabelPopUpComponent implements OnInit {

  private subscriptions: Subscription;

  @Output() public closeRelabelPopUp = new EventEmitter();
  @Input() public info: RectOnDOM;
  @Input()  public label: string;
  @Output() public labelChange = new EventEmitter<string>();
  @ViewChild('relabelTextArea') public relabelTextAreaRef: ElementRef;


  constructor() { }
  public isClosingPopUp():void {
    this.closeRelabelPopUp.emit();
  }

  public ngAfterViewInit(): void {
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

  public ngOnInit(): void {
    this.subscriptions = new Subscription();
  }

  public updateLabel():void {
    this.labelChange.emit(this.convertToMultiline(this.label));
  }

  private convertToMultiline(text: string):string {
    return text.replace('\n', '\n');
  }
}
