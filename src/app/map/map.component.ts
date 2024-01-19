import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-arrowheads';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";
import { DataService } from '../data.service';
type DataGraphDB = {
  head: { vars: string[] },
  results: { bindings: any[] }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})

export class MapComponent implements OnInit {

  map: any;
  jsonData : DataGraphDB
  constructor(private dataService: DataService) {}

  public ngOnInit(): void {
    // const origin_coord = new L.LatLng(47.5596, 7.5886) //basel
    // const destination_coord = new L.LatLng(46.2044, 6.1432) // geneva
    // const stage1 = new L.LatLng(47.4866, 7.7334) // Liestal
    // const stage2 = new L.LatLng(47.3815, 7.7469) // Waldenburg
    // const stage3 = new L.LatLng( 47.2088,7.5323) // solothurn
    // const stage4 = new L.LatLng(47.1368, 7.2468) // Biel/Bienne
    // const stage5 = new L.LatLng(46.8806, 7.0427) // Avenches
    // const stage6 = new L.LatLng(46.5197, 6.6323) // Lausanne
    // const stage7 = new L.LatLng(46.3166, 6.1936) // Coppet
    // const stages = [origin_coord, stage1, stage2, stage3, stage4, stage5, stage6, stage7, destination_coord]
    this.readDate('http://rdfh.ch/0801/GcXDoaZgRu6E2scC77h6gw').subscribe((data) => {
      this.jsonData = data
      if (this.jsonData.results.bindings.length>0) {
        const origin = this.get_origin()
        const destination = this.get_destination()
        const centroid = this.calculate_center(origin, destination)
        this.loadMap(centroid);
        this.addMarkers(origin, destination);
        this.addLines();
      }
    }
    )

  }

  private get_origin(): L.LatLng {
      const firstObject = this.jsonData.results.bindings[0];
      const latitude = firstObject.startLat.value
      const longitude = firstObject.startLong.value
      return new L.LatLng(latitude, longitude)
  }

  private get_destination(): L.LatLng {
    const length = this.jsonData.results.bindings.length
    const lastObject = this.jsonData.results.bindings[length-1]
    const latitude = lastObject.endLat.value
    const longitude = lastObject.endLong.value
    return new L.LatLng(latitude, longitude)
  }
  private calculate_center(origin: L.LatLng, destination: L.LatLng): L.LatLng {
    const middle_point_lat = (origin.lat + destination.lat)/2
    const middle_point_lng = (origin.lng + destination.lng)/2
    const centroid = new L.LatLng(middle_point_lat, middle_point_lng)
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
        iconSize: new L.Point(40, 40),
        iconAnchor: [13, 41],
        iconUrl: 'assets/red_marker.svg',
      }), title: 'Workspace'
    } as L.MarkerOptions);
    origin.addTo(this.map);
    const destination = L.marker(destination_coord, {
      icon: new L.Icon({
        iconSize: new L.Point(40, 40),
        iconAnchor: [13, 41],
        iconUrl: 'assets/blue_marker.svg',
      }), title: 'Workspace'
    } as L.MarkerOptions);
    destination.addTo(this.map)
  }

  private addLines(): void {
    this.jsonData.results.bindings.forEach((obj, index) => {
      const start =  new L.LatLng(obj.startLat.value, obj.startLong.value)
      const end = new  L.LatLng(obj.endLat.value, obj.endLong.value)
      const line = L.polyline([start, end], {
        color: '#800080'
      } as L.PolylineOptions).arrowheads({size: '15%'});
      line.addTo(this.map)
    })
  }


  private readDate(entryIri: string): Observable<DataGraphDB> {
    return this.dataService.make_coordinates_query(entryIri)
  }

}
