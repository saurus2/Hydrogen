import { Component, ElementRef, ViewChild } from '@angular/core';
import { GmapsService } from '../services/gamps/gmaps.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  
  @ViewChild('map', {static: true}) mapElementRef: ElementRef;
  googleMaps: any;

  constructor(
    private gmaps: GmapsService
  ) {}
  
  async loadMap() {
    try {
      let googleMaps: any = await this.gmaps.loadGoogleMaps();

    } catch(e) {
      console.log(e);
    }
    
  }
}
