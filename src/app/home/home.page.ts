import { Component, ElementRef, OnInit, Renderer2, ViewChild, NgZone, OnDestroy, inject } from '@angular/core';
import { GmapsService } from '../services/gamps/gmaps.service';
import { ClearWatchOptions, Geolocation } from '@capacitor/geolocation';
import { IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NrelService } from '../services/nrel.service';
import { HttpClient } from '@angular/common/http';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})

export class HomePage implements OnInit, OnDestroy{
  
  @ViewChild('map', { static: true })
  mapElementRef!: ElementRef;
  googleMaps: any;
  center = { lat: 37.335480, lng: -121.893028 };
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  currentLat: any;
  currentLng: any;
  watchId: any;
  // hiding the list
  isListOpen = true;

  // google map search
  places: any[] = [];
  query: string;
  placesSub: Subscription;
  private _places = new BehaviorSubject<any[]>([]);

  get search_places() {
    return this._places.asObservable();
  }

  // Inject a nrel API
  // Dependency Injection
  private nrelServices = inject(NrelService);

  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private platform: Platform,
    public ngZone: NgZone,
    public http: HttpClient,
  ) {
    // this.renderer.listen('window', 'click', (e:Event)=> {
    //   if(e.target !== this.map.nativeElement) {
    //     console.log("clicked map out")
    //   }
    // });
  }
  
  // search implement
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  // search storing places
  ngOnInit(): void {
    this.placesSub = this.search_places.subscribe({
      next: (places) => {
        this.places = places;
      },
      error: (e) => {
        console.log(e);
      }
    })
  }

  ngAfterViewInit(){
    this.loadMap();
    this.isListOpen = true;
    this.loadAllStations();
  }

  // loading map
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

  // Click event to add marker
  onMapClick(){
    this.mapClickListener = this.googleMaps.event.addListener(this.map, "click", (mapMouseEvent: { latLng: { toJSON: () => any; }; }) => {
      console.log("hi",mapMouseEvent.latLng.toJSON());
      this.addMarker(mapMouseEvent.latLng);
    });
  }
  
  // adding marker function
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
    // adding markers in array as add and remove
    this.markers.push(marker);
    this.markerClickListener = this.googleMaps.event.addListener(marker, "click", () => {
      console.log('markerclick', marker);
      this.checkAndRemoveMarker(marker);
      console.log('markers: ', this.markers);
    });
  }

  // removing marker function
  checkAndRemoveMarker(marker: any) {
    const index = this.markers.findIndex(x => x.position.lat() == marker.position.lat() && x.position.lng() == marker.position.lng());
    console.log('is marker already: ', index);
    if(index >= 0) {
      this.markers[index].setMap(null);
      this.markers.splice(index, 1);
      return;
    }
  }

  // getting current lat & lng by google api
  async getLocation() {
    let googleMaps: any = await this.gmaps.loadGoogleMaps();
    this.googleMaps = googleMaps;

    const coordinates = await Geolocation.getCurrentPosition();
    this.currentLat = coordinates.coords.latitude;
    this.currentLng = coordinates.coords.longitude;

    console.log("currentLat: ", this.currentLat, "currentLng: ", this.currentLng);

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

  // get the query from input
  async onSearchChange(event: any) {
    this.isListOpen = true;
    this.query = event.detail.value;
    if (this.query.length > 0) {
      await this.getPlaces();
    }
  }

  // get place items from autocompleteservice 
  async getPlaces() {
    try {
      let service = new google.maps.places.AutocompleteService();
      service.getQueryPredictions({
        input: this.query,
      }, (predictions, status) => {
        let AutocompleteItems = [];
        this.ngZone.run(async () => {
          if (predictions != null) {
            for (const prediction of predictions) {
              let latLng: any = await this.geoCode(prediction.description);
              const places = {
                title: prediction.structured_formatting.main_text,
                address: prediction.description,
                lat: latLng.lat,
                lng: latLng.lng
              };
              AutocompleteItems.push(places);
            }
            this.places = AutocompleteItems;
            console.log('final places', this.places);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  // get lat and lng address
  geoCode(address: any) {
    let latlng = {lat: '', lng: ''};
    return new Promise((resolve, reject) => {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address' : address}, (results) => {
        // console.log('results ', results);
        latlng.lat = results[0].geometry.location.lat();
        latlng.lng = results[0].geometry.location.lng();
        resolve(latlng);
      })
    })
  }

  // close the list
  closeList() {
    this.isListOpen = false;
  }

  // destroy subscribe funciton for memory leak
  onDestroy(): void{
    if(this.placesSub) this.placesSub.unsubscribe();
  }

  // need to seperate component
  // load nrel API
  async loadAllStations() {
    this.nrelServices.getAllStations(this.currentLat, this.currentLng).subscribe((res) => {
      let googleMaps: any = this.googleMaps;
      console.log("getAllStations in home page, currentLat: ", this.currentLat, "currentLng: ", this.currentLng);

      // console.log(res);
      // Transfer the data to the json format
      const jsonRes = JSON.stringify(res);
      // console.log(jsonRes);
      const parseRes = JSON.parse(jsonRes);
      console.log(parseRes.fuel_stations);
      
      // for loop to print
      // parseRes.fuel_stations.forEach(function(item: { station_name: any; street_address: any; }) {
      parseRes.fuel_stations.forEach((item: any) => {
        console.log(item.station_name, item.street_address);
        console.log(item.latitude, item.longitude);
        const location = new googleMaps.LatLng(item.latitude, item.longitude);
        this.addMarker(location);
      });
    });
  }
}
