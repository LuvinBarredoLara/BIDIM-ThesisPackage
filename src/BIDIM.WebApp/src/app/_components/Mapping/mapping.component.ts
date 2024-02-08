import { Component, Inject, OnInit } from '@angular/core';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMappingDialogData } from 'src/app/_viewModels/MappingViewModels';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import { MappingService } from 'src/app/_services/Mapping/mapping.service';
import StringHelper from 'src/app/_shared/helpers';
import { Feature } from 'ol';
import { Icon, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { toLonLat } from 'ol/proj';

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.css'],
})
export class MappingComponent implements OnInit {
  isLoading: boolean = false;
  map!: Map;
  lookupHasNoResults: boolean = false;
  lookupAttempts: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public mappingData: IMappingDialogData,
    public mappingSvc: MappingService,
    private dialogRef: MatDialogRef<MappingComponent>
  ) {}

  ngOnInit(): void {
    // Look up initial map loc for easier navigation
    this.LookupInitialLocation$(
      this.mappingData.CityMun,
      this.mappingData.Brgy,
      this.mappingData.HouseholdCoordinate
    );
  }

  // This will look up the location string based on
  // the dropdown values provided from patient data
  LookupInitialLocation$(
    cityMun: string,
    brgy: string,
    householdCoord: number[]
  ): void {
    if (this.isLoading) {
      SweetAlerts.ShowLoadingToast();
    } else {
      this.isLoading = true;

      if (householdCoord.length != 0) {
        this.map = this.initializeMap$(
          householdCoord[0],
          householdCoord[1],
          true
        );
        this.isLoading = false;
      } else {
        var loc = StringHelper.ReplaceNonAlphaNumericWithSpace(
          cityMun + ' ' + brgy
        )
          .trim()
          .replace(/\s+/g, '+');
        this.mappingSvc.LookupLocStr(loc).subscribe({
          next: (response) => {
            if (response.features.length === 0) {
              this.lookupHasNoResults = true;
            } else {
              this.lookupHasNoResults = false;
              let locLongLat = response.features[0].geometry.coordinates;
              this.map = this.initializeMap$(
                locLongLat[0],
                locLongLat[1],
                false
              );
            }
          },
          error: (err) => {
            this.isLoading = false;
            SweetAlerts.ShowErrorToast(err.message);
          },
          complete: () => {
            this.isLoading = false;
            if (this.lookupHasNoResults) {
              if (this.lookupAttempts >= 2) {
                this.lookupAttempts = 0;
                this.lookupHasNoResults = false;
                this.map = this.initializeMap$(122.5686136, 10.7026718, false);
              }
              this.lookupAttempts += 1;
              this.LookupInitialLocation$(
                this.mappingData.CityMun + '+' + 'iloilo',
                '',
                []
              );
            }
          },
        });
      }
    }
  }

  CloseMapping$(isCancel: boolean): void {
    if (isCancel) {
      this.dialogRef.close();
    } else {
      if (this.mappingData.HouseholdCoordinate.length === 0)
        SweetAlerts.ShowWarningToast('Please locate household');
      else this.dialogRef.close({ data: this.mappingData.HouseholdCoordinate });
    }
  }

  private initializeMap$ = (lon: number, lat: number, hasMarker: boolean) => {
    let mapVal = new Map({
      target: 'map',
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom: 15,
        maxZoom: 20,
      }),
    });

    let standardLayer = new TileLayer({
      source: new OSM(),
      visible: true,
    });

    mapVal.addLayer(standardLayer);

    let markerVector = new VectorLayer();

    if (hasMarker) {
      markerVector = this.GetMarkerVector$(fromLonLat([lon, lat]));
      mapVal.addLayer(markerVector);
    }

    mapVal.on('click', (e) => {
      // convert for precise pinpoint
      let coord = toLonLat(e.coordinate);
      if (this.mappingData.HouseholdCoordinate.length != 0) {
        SweetAlerts.AskQuestion(
          'Existing household mapping',
          'Overwrite?'
        ).then((response) => {
          if (response.value) {
            mapVal.removeLayer(markerVector);
            markerVector = this.GetMarkerVector$(e.coordinate);
            mapVal.addLayer(markerVector);
            this.mappingData.HouseholdCoordinate = coord;
          }
        });
      } else {
        markerVector = this.GetMarkerVector$(e.coordinate);
        mapVal.addLayer(markerVector);
        this.mappingData.HouseholdCoordinate = coord;
      }
    });

    return mapVal;
  };

  private GetMarkerVector$ = (coords: number[]) => {
    let markerGeometry = new Point(coords);
    let markerFeature = new Feature({
      geometry: markerGeometry,
      name: 'markerPin',
    });
    let markerStyle = new Icon({
      src: './assets/images/geopin.png',
      scale: 0.04,
    });
    markerFeature.setStyle(
      new Style({
        image: markerStyle,
      })
    );
    let vectorSource = new VectorSource({
      features: [markerFeature],
    });
    let markerLayer = new VectorLayer({
      source: vectorSource,
    });
    return markerLayer;
  };
}
