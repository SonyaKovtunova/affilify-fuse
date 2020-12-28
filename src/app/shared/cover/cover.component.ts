import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss']
})
export class CoverComponent implements OnInit {

  @Input() guid: string;
  @Input() src: string;
  @Input() text: string;
  @Input() position: string;
  @Input() onlyLimits: boolean;
  
  constructor() { }

  ngOnInit(): void {
  }

  getUrl(): string {
    if (this.guid) {
      return `${environment.serverUrl}image/${this.guid}`;
    }
    
    return this.src;
  }
}
