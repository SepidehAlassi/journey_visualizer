// data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
type DataGraphDB = {
  head: { vars: string[] },
  results: { bindings: any[] }
}
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private dataUrl = '../assets/stages.json';

  constructor(private http: HttpClient) {}

  getData(): Observable<DataGraphDB> {
    return this.http.get<DataGraphDB>(this.dataUrl);
  }

  make_coordinates_query(entryIri: string): Observable<DataGraphDB> {
    const stageCoordinatesTemplate = `
        PREFIX trip-onto: <http://journeyStar.dhlab.ch/ontology/trip-onto#>
      PREFIX schema: <https://schema.org/>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdp: <http://www.wikidata.org/prop/>
      PREFIX wdps: <http://www.wikidata.org/prop/statement/value/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX wikibase: <http://wikiba.se/ontology#>
      SELECT ?startWikiIri ?startLat ?startLong ?endWikiIri ?endLat ?endLong ?startDate ?endDate ?Transportation
      WHERE {
         ?journey a trip-onto:Journey .
          BIND(<${entryIri}> AS ?entryIRI)
          BIND (<< ?person trip-onto:hasJourney ?journey>> AS ?journeyTriple)
          ?journeyTriple trip-onto:mentionedIn ?entryIRI .
          ?journeyTriple trip-onto:hasStage ?stage .
          BIND(<<?journeyTriple trip-onto:hasStage ?stage>> AS ?stageTriple)
          ?stage trip-onto:hasStartLocation ?FromLocation .
          ?FromLocation trip-onto:hasWikiLink ?startWikiIri .

          ?stageTriple trip-onto:hasEndDate ?endDate .
          ?stageTriple trip-onto:hasStartDate ?startDate .
          ?stage trip-onto:hasDestination ?ToLocation .
          ?ToLocation trip-onto:hasWikiLink ?endWikiIri .
          ?stage trip-onto:meanOfTransportation ?meanOfTransportation .
          ?meanOfTransportation schema:name ?Transportation .
          OPTIONAL{
              SERVICE <https://query.wikidata.org/sparql> {
                  ?startWikiIri wdp:P625 ?coordinate_start.

                  ?coordinate_start wdps:P625 ?coordinate_node_start.
                  ?coordinate_node_start wikibase:geoLongitude ?startLong.
                  ?coordinate_node_start wikibase:geoLatitude ?startLat.

                  ?endWikiIri wdp:P625 ?coordinate_end .
                  ?coordinate_end wdps:P625 ?coordinate_node_end.
                  ?coordinate_node_end wikibase:geoLongitude ?endLong.
                  ?coordinate_node_end wikibase:geoLatitude ?endLat.

              }
          }
      }
    `;
    return this.requestGraphDB(stageCoordinatesTemplate)
  }
  requestGraphDB(query: string): Observable<DataGraphDB> {

      const url = "http://localhost:7200/repositories/journeyStar";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      }

      const body = new HttpParams()
        .set('query', query)

      return this.http.post<DataGraphDB>(url, body, {'headers': headers, withCredentials: true });
    }
}
