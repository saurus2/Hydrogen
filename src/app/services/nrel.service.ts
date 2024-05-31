import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';

// Service = Class having focused purpose
// Json response from nrel 
// ref: https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/all/
const BASE_URL = 'https://developer.nrel.gov';
const API_KEY = environment.nrelApiKey;

@Injectable({
  providedIn: 'root'
})
export class NrelService {
  // Dependency Injection
  private http = inject(HttpClient);
  
  constructor() { }

  getAllStations(lat: any, lng: any) {
    console.log("nrel getAllStations lat: ", lat, " lng: ", lng);
    return this.http.get(`${BASE_URL}/api/alt-fuel-stations/v1/nearest.json?api_key=${API_KEY}&latitude=${lat}&longitude=${lng}&fuel_type=HY`);
  }
}
