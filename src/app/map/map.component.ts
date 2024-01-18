import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  map: any;

  constructor() {
  }

  public ngAfterViewInit(): void {
    const origin_coord = new L.LatLng(47.5596, 7.5886)
    const destination_coord = new L.LatLng(46.2044, 6.1432)
    var centroid = this.calculate_center(origin_coord, destination_coord)
    this.loadMap(centroid);
    this.addMarkers(origin_coord, destination_coord);
  }

  private calculate_center(origin_coord: L.LatLng, destination_coord: L.LatLng): L.LatLng {

    const centroid = new L.LatLng(46.882, 6.8659)
    return centroid
  }

  private loadMap(centroid: L.LatLngExpression): void {
    this.map = L.map('map', {center: centroid, zoom: 8.4});
    const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: environment.mapbox.accessToken,
    })
    tiles.addTo(this.map);
  }

  private addMarkers(origin_coord: L.LatLng, destination_coord: L.LatLng): void {
    const origin = L.marker(origin_coord, {
      icon: new L.Icon({
        iconSize: [50, 41],
        iconAnchor: [13, 41],
        iconUrl: 'assets/red_marker.svg',
      }), title: 'Workspace'
    } as L.MarkerOptions);
    origin.addTo(this.map);
    const destination = L.marker(destination_coord, {
      icon: new L.Icon({
        iconSize: [50, 41],
        iconAnchor: [13, 41],
        iconUrl: 'assets/blue_marker.svg',
      }), title: 'Workspace'
    } as L.MarkerOptions);
    destination.addTo(this.map)
  }

}
