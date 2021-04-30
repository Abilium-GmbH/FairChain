import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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

  //@ViewChild('relabelTextArea') relabelTextAreaRef: ElementRef;
  @ViewChild('relabelTextArea') relabelTextAreaRef: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.relabelTextArea.innerText = this.label;
  }

  public updateLabel() {
    this.labelChange.emit(this.convertToMultiline(this.relabelTextArea.innerText));
  }

  private convertToMultiline(text: string) {
    return text.replace('\n', '\n');
  }

  public get relabelTextArea() {
    return this.relabelTextAreaRef.nativeElement;
  } 
  
}
