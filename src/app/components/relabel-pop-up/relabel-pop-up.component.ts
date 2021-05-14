import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { strict as assert } from 'assert';
import { RectOnDOM } from 'src/app/interfaces/RectOnDOM';

@Component({
  selector: 'relabel-pop-up',
  templateUrl: './relabel-pop-up.component.html',
  styleUrls: ['./relabel-pop-up.component.scss']
})
export class RelabelPopUpComponent implements OnInit {

  private prevLabel: string;

  constructor() { }

  private max_cols = 15;

  @Input() info: RectOnDOM;
  
  @Input()  label: string;
  @Output() labelChange = new EventEmitter<string>();

  @ViewChild('relabelTextArea') relabelTextAreaRef: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.relabelTextArea.innerText = this.label;
    this.prevLabel = this.label;
  }

  private f(label: string): string {
    let out = '';
    for (let i = 0; i < label.length; i++) {
      out += label.charAt(i);
      if (i % this.max_cols === 0 && i+1 !== label.length) out += '\n';
    }
    return out;
  }

  public updateLabel() {
    this.relabelTextArea.innerText = this.f(this.label);
    this.prevLabel = this.relabelText;
    this.labelChange.emit(this.convertToMultiline(this.relabelText));
  }

  private convertToMultiline(text: string) {
    return text.replace('\n', '\n');
  }

  private get relabelTextArea() {
    return this.relabelTextAreaRef.nativeElement;
  }
  
  private get relabelText(): string {
    return this.relabelTextArea.innerText;
  }

  private set relabelText(text: string) {
    this.relabelTextArea.innerText = text;
  }
  
}
