import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GmapsService {

  constructor() { }
  loadGoogleMaps(): Promise<any> {
    // window
    const win = window as any;
    // how to call google map
    const gModule = win.google;
    // check google map is loaded
    if(gModule && gModule.maps){
      // google map module
      return Promise.resolve(gModule.maps);
    }
    return new Promise((resolve, reject) => {
      // helpful calling google map api 
      // creating script and make body are important
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=' +
        environment.googleMapsApiKey;
      // asyncronous
      script.async = true;
      // loading the map
      script.defer = true;
      // javascript make work
      document.body.appendChild(script);
      script.onload = () => {
        // check google map 
        const loadedGoogleModule = win.google;
        if(loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Map SDK is not Available');
        }
      };
    })
  }
}
