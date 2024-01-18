import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-arrowheads';

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
    const origin_coord = new L.LatLng(47.5596, 7.5886) //basel
    const destination_coord = new L.LatLng(46.2044, 6.1432) // geneva
    const stage1 = new L.LatLng(47.4866, 7.7334) // Liestal
    const stage2 = new L.LatLng(47.3815, 7.7469) // Waldenburg
    const stage3 = new L.LatLng( 47.2088,7.5323) // solothurn
    const stage4 = new L.LatLng(47.1368, 7.2468) // Biel/Bienne
    const stage5 = new L.LatLng(46.8806, 7.0427) // Avenches
    const stage6 = new L.LatLng(46.5197, 6.6323) // Lausanne
    const stage7 = new L.LatLng(46.3166, 6.1936) // Coppet
    const stages = [origin_coord, stage1, stage2, stage3, stage4, stage5, stage6, stage7, destination_coord]
    const centroid = this.calculate_center(origin_coord, destination_coord)
    this.loadMap(centroid);
    this.addMarkers(origin_coord, destination_coord);
    this.addLine(stages)
  }

  private calculate_center(origin_coord: L.LatLng, destination_coord: L.LatLng): L.LatLng {
    const middle_poing_lat = (origin_coord.lat+destination_coord.lat)/2
    const middle_point_lng = (origin_coord.lng+destination_coord.lng)/2
    const centroid = new L.LatLng(middle_poing_lat, middle_point_lng)
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

  private addLine(stages: L.LatLng[]): void {
    const line = L.polyline(stages, {
      color: '#0d9148'
    } as L.PolylineOptions).arrowheads({ size: '15%' });
    line.addTo(this.map)
  }

}
