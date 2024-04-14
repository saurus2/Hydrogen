import { Component, ElementRef, OnInit, Renderer2, ViewChild, NgZone } from '@angular/core';
import { GmapsService } from '../services/gamps/gmaps.service';
import { ClearWatchOptions, Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';

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
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  currentLat: any;
  currentLng: any;
  watchId: any;

  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private platform: Platform,
    public ngZone: NgZone,
  ) {

  }
  
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
      this.addMarker(location);
      this.onMapClick();
    } catch(e) {
      console.log(e);
    } 
  }

  onMapClick(){
    this.mapClickListener = this.googleMaps.event.addListener(this.map, "click", (mapMouseEvent: { latLng: { toJSON: () => any; }; }) => {
      console.log("hi",mapMouseEvent.latLng.toJSON());
      this.addMarker(mapMouseEvent.latLng);
    });
  }

  addMarker(location: any){
    let googleMaps: any = this.googleMaps;
    const icon = {
      url: 'assets/icon/pin.png',
      scaledSize: new googleMaps.Size(35, 50),
    };
    // console.log("hello", location);
    const marker = new googleMaps.Marker({
      position: location,
      map: this.map,
      icon: icon,
      draggable: true,
    });
    this.markers.push(marker);
    this.markerClickListener = this.googleMaps.event.addListener(marker, "click", () => {
      console.log('markerclick', marker);
      this.checkAndRemoveMarker(marker);
      console.log('markers: ', this.markers);
    });
  }

  checkAndRemoveMarker(marker: any) {
    const index = this.markers.findIndex(x => x.position.lat() == marker.position.lat() && x.position.lng() == marker.position.lng());
    console.log('is marker already: ', index);
    if(index >= 0) {
      this.markers[index].setMap(null);
      this.markers.splice(index, 1);
      return;
    }
  }

  async getLocation() {
    let googleMaps: any = await this.gmaps.loadGoogleMaps();
    this.googleMaps = googleMaps;

    const coordinates = await Geolocation.getCurrentPosition();
    this.currentLat = coordinates.coords.latitude;
    this.currentLng = coordinates.coords.longitude;

    const location = new googleMaps.LatLng(this.currentLat, this.currentLng);
    const icon = {
      url: 'assets/icon/pin.png',
      scaledSize: new googleMaps.Size(35, 50),
    };

    console.log('Current position:', location);
    var marker = new googleMaps.Marker({
      position: location,
      map: this.map,
    });
    this.map.setCenter(location);
  }
}
