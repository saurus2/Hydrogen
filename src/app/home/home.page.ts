import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { GmapsService } from '../services/gamps/gmaps.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  
  @ViewChild('map', { static: true })
  mapElementRef!: ElementRef;
  googleMaps: any;
  center = { lat: 28.649944693035188, lng: 77.23961776224988 };
  map: any;

  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
  ) {}
  
  ngOnInit(): void {

  }

  ngAfterViewInit(){
    this.loadMap();
  }

  async loadMap() {
    try {
      let googleMaps: any = await this.gmaps.loadGoogleMaps();
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      const location = new googleMaps.LatLng(this.center.lat, this.center.lng);
      this.map = new googleMaps.Map(mapEl, {
        center: location,
        zoom: 12,
      });
      this.renderer.addClass(mapEl, 'visible');
    } catch(e) {
      console.log(e);
    }
    
  }
}
