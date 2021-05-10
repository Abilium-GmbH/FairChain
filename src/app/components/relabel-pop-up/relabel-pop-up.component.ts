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

  public updateLabel() {
    if (this.isNotAbleToUpdate()) this.denyUpdate();
    this.applyUpdateToLabel()
  }
  
  private denyUpdate() {
    this.relabelText = this.prevLabel;
    throw new Error('Character Limit reached');
  }

  private applyUpdateToLabel() {
    this.prevLabel = this.relabelText;
    this.labelChange.emit(this.convertToMultiline(this.relabelText));
  }

  private isNotAbleToUpdate(): boolean {
    return false;
    //if (this.relabelText.length > this.maxNumCharacters) return true;
    //if (this.relabelText.split('\n').length > this.maxRow + 1) return true;
  }

  private convertToMultiline(text: string) {
    return text.replace('\n', '\n');
  }

  public get relabelTextArea() {
    return this.relabelTextAreaRef.nativeElement;
  }
  
  public get relabelText(): string {
    return this.relabelTextArea.innerText;
  }

  public set relabelText(text: string) {
    this.relabelTextArea.innerText = text;
  }
  
}
