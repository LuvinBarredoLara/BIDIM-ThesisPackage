import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { IPHBrgy, IPHCityMun } from 'src/app/_viewModels/PHLocsViewModel';
import PHCityMun from '../../../assets/phlocjson/refcitymun.json';
import PHBrgy from '../../../assets/phlocjson/refbrgy.json';
import SweetAlerts from 'src/app/_shared/sweetAlerts';
import StringHelper, { DateHelper } from 'src/app/_shared/helpers';
import { IInfectiousDisease } from 'src/app/_viewModels/PatientViewModels';
import { DiseaseService } from 'src/app/_services/Disease/disease.service';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import CircleGeom from 'ol/geom/Circle';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import Map from 'ol/Map';
import { MappingService } from 'src/app/_services/Mapping/mapping.service';
import { IInfectedFilter } from 'src/app/_viewModels/MappingViewModels';
import { XYZ } from 'ol/source';

@Component({
  selector: 'app-mappingpage',
  templateUrl: './mappingpage.component.html',
  styleUrls: ['./mappingpage.component.css'],
})
export class MappingpageComponent implements OnInit {
  IsLoading: boolean = false;
  map!: Map;
  // Locations
  CityMuns: IPHCityMun[] = [];
  // Do not load brgys yet until user selects city
  Brgys: IPHBrgy[] = [];
  Diseases: IInfectiousDisease[] = [];

  MappingPageFilterForm = this.fb.group({
    CityMunFilter: new FormControl({
      value: '063043',
      disabled: this.IsLoading,
    }), // Default Santa barbara
    BrgyFilter: new FormControl({
      value: '063043004',
      disabled: this.IsLoading,
    }), // Default Balabag
    DateFrom: new FormControl({
      value: new Date('01/01/2019'),
      disabled: this.IsLoading,
    }),
    DateTo: new FormControl({
      value: new Date('12/31/2022'),
      disabled: this.IsLoading,
    }),
    DiseaseFilter: new FormControl({
      value: 1,
      disabled: this.IsLoading,
    }),
  });
  MappingPageFFControls = this.MappingPageFilterForm.controls;
  DateToMinDate: Date = new Date();

  private LocationCoords: number[] = [];
  private HeatMapCoords: number[][] = [];
  private InfectedFilter!: IInfectedFilter;

  constructor(
    private fb: FormBuilder,
    public diseaseSvc: DiseaseService,
    public mappingSvc: MappingService
  ) {}

  ngOnInit(): void {
    // Load up locations
    // Default to Sta. barbara, balabag
    this.CityMuns = PHCityMun.RECORDS.filter((cm) => cm.provCode == '0630');
    this.Brgys = PHBrgy.RECORDS.filter(
      (b) =>
        b.citymunCode == this.MappingPageFilterForm.controls.CityMunFilter.value
    );

    // Load up diseases dropdown
    this.IsLoading = true;
    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';
    this.diseaseSvc.GetAllActiveDropdown().subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          this.Diseases = response.Data ?? [];
        }
      },
      error: (err) => {
        this.IsLoading = false;
        SweetAlerts.ShowErrorToast(err.message);
      },
      complete: () => {
        if (Is200Fail) {
          this.IsLoading = false;
          SweetAlerts.ShowErrorToast(d200FailMssg);
        } else {
          this.IsLoading = false;
          this.ApplyFilter();
        }
      },
    });
  }

  UpdateMinDate(): void {
    if (
      new Date(
        this.MappingPageFFControls.DateTo.value?.toLocaleDateString() ?? ''
      ) <
      new Date(
        this.MappingPageFFControls.DateFrom.value?.toLocaleDateString() ?? ''
      )
    )
      this.MappingPageFFControls.DateTo.setValue(
        new Date(
          this.MappingPageFFControls.DateFrom.value?.toLocaleDateString() ?? ''
        )
      );

    this.DateToMinDate = new Date(
      this.MappingPageFFControls.DateFrom.value?.toLocaleDateString() ?? ''
    );
  }

  FilterBrgyByCityMun(e: any): void {
    this.Brgys = PHBrgy.RECORDS.filter(
      (b) => b.citymunCode == this.MappingPageFFControls.CityMunFilter.value
    );
    this.MappingPageFFControls.BrgyFilter.setValue(this.Brgys[0].brgyCode);

    this.ApplyFilter();
  }

  ApplyFilter(): void {
    let cityMun = this.BuildCityMunFilter();
    let brgy = this.BuildBrgyFilter();
    this.InfectedFilter = this.BuildInfectedFilter();

    // actual start of initializing map
    // see complete callback
    this.GetLocationFilterCoords(cityMun, brgy);

    this.UpdateMinDate();
  }

  private BuildCityMunFilter(): string {
    let cityMun =
      this.CityMuns.find((cm) => {
        return (
          cm.citymunCode === this.MappingPageFFControls.CityMunFilter.value
        );
      })?.citymunDesc ?? 'santa barbara iloilo';

    return cityMun;
  }

  private BuildBrgyFilter(): string {
    let brgy =
      this.Brgys.find((b) => {
        return b.brgyCode === this.MappingPageFFControls.BrgyFilter.value;
      })?.brgyDesc ?? '';

    return brgy;
  }

  private BuildInfectedFilter(): IInfectedFilter {
    let dateFromStr =
        this.MappingPageFFControls.DateFrom.value?.toLocaleDateString() ??
        new Date().toLocaleDateString(),
      dateToStr =
        this.MappingPageFFControls.DateTo.value?.toLocaleDateString() ??
        new Date().toLocaleDateString();

    let diseaseId = this.MappingPageFFControls.DiseaseFilter.value ?? 1;

    let infectedFilter: IInfectedFilter = {
      // CityMun: this.MappingPageFFControls.CityMunFilter.value ?? '063043', // Santa barbara
      // Brgy: this.MappingPageFFControls.BrgyFilter.value ?? '063043004', // Balabag
      DateFrom: dateFromStr,
      DateTo: dateToStr,
      InfectiousDiseaseId: diseaseId,
    };

    return infectedFilter;
  }

  private GetLocationFilterCoords(cityMun: string, brgy: string): void {
    this.IsLoading = true;

    let retVal: number[] = [];
    let hasNoResults = false;
    let lookupAttempts: number = 0;

    let locStr = StringHelper.ReplaceNonAlphaNumericWithSpace(
      cityMun + ' ' + brgy
    )
      .trim()
      .replace(/\s+/g, '+');

    this.mappingSvc.LookupLocStr(locStr).subscribe({
      next: (response) => {
        if (response.features.length === 0) {
          hasNoResults = true;
        } else {
          retVal = response.features[0].geometry.coordinates;
        }
      },
      error: (err) => {
        this.IsLoading = false;
        SweetAlerts.ShowErrorToast(err.message);
        return;
      },
      complete: () => {
        this.IsLoading = false;
        if (hasNoResults) {
          if (lookupAttempts >= 2) {
            retVal = [122.5686136, 10.7026718];
          } else {
            lookupAttempts += 1;
            this.GetLocationFilterCoords(cityMun + ' ' + 'iloilo', '');
          }
        } else {
          this.LocationCoords = retVal;
          this.GetHeatMapCoords(this.InfectedFilter);
        }
      },
    });
  }

  private GetHeatMapCoords(infectedFilter: IInfectedFilter): void {
    this.IsLoading = true;

    let retVal: number[][] = [];
    let Is200Fail: boolean = false;
    let d200FailMssg: string = '';

    this.mappingSvc.GetCoordinates(infectedFilter).subscribe({
      next: (response) => {
        if (!response.IsSuccess) {
          Is200Fail = true;
          d200FailMssg = response.Message ?? '';
        } else {
          retVal = response.Data ?? [];
        }
      },
      error: (err) => {
        this.IsLoading = false;
        SweetAlerts.ShowErrorToast(err.message);
      },
      complete: () => {
        this.IsLoading = false;
        if (Is200Fail) {
          SweetAlerts.ShowErrorToast(d200FailMssg);
          return;
        } else {
          this.HeatMapCoords = retVal;
          this.InitializeMap(this.LocationCoords, this.HeatMapCoords);
        }
      },
    });
  }

  private InitializeMap(
    locationCoords: number[],
    heatMapCoords: number[][]
  ): void {
    let tileLayer = new TileLayer({
      source: new XYZ({
        attributions: [
          'Powered by Esri',
          'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        ],
        attributionsCollapsible: false,
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 23,
      }),
    });

    if (this.map === undefined) {
      this.map = new Map({
        target: 'map',
        view: new View({
          center: fromLonLat([locationCoords[0], locationCoords[1]]),
          zoom: 15,
        }),
      });
    } else {
      this.map.setView(
        new View({
          center: fromLonLat([locationCoords[0], locationCoords[1]]),
          zoom: 15,
        })
      );
    }

    this.map.setLayers([tileLayer]);

    if (heatMapCoords.length > 0) {
      heatMapCoords.forEach((hmc) => {
        setTimeout(() => {
          let markerVector = this.GetNewMarkerVector(
            fromLonLat([hmc[0], hmc[1]])
          );
          this.map.addLayer(markerVector);
        }, 1000);
      });
    }
  }

  private GetMarkerVector = (coords: number[]) => {
    let markerGeometry = new Point(coords);
    let markerFeature = new Feature({
      geometry: markerGeometry,
      name: 'markerPin',
    });
    let markerStyle = new Icon({
      src: './assets/images/geopin_red.png',
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

  private GetNewMarkerVector = (coords: number[]) => {
    let circleFeature = new Feature({
      geometry: new CircleGeom(coords, 100),
    });
    circleFeature.setStyle(
      new Style({
        renderer(coordinates: any, state) {
          const [[x, y], [x1, y1]] = coordinates;
          const ctx = state.context;
          const dx = x1 - x;
          const dy = y1 - y;
          const radius = Math.sqrt(dx * dx + dy * dy);

          const innerRadius = 0;
          const outerRadius = radius * 2;

          const gradient = ctx.createRadialGradient(
            x,
            y,
            innerRadius,
            x,
            y,
            outerRadius
          );
          gradient.addColorStop(0, 'rgba(255,0,0,0.7)');
          gradient.addColorStop(0.5, 'rgba(255,0,0,0.3)');
          gradient.addColorStop(1, 'rgba(255,0,0,0)');
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
          ctx.strokeStyle = 'transparent';
          ctx.stroke();
        },
      })
    );

    // let markerGeom = new Point(coords);
    // let markerFeature = new Feature({
    //   geometry: markerGeom,
    //   name: 'markerPin',
    //   style: new Style({
    //     image: new Circle({
    //       radius: 5,
    //       fill: new Fill({
    //         color: 'rgb(255,0,0)',
    //       }),
    //       stroke: new Stroke({
    //         color: 'rgb(255,0,0)',
    //         width: 0.4,
    //       }),
    //     }),
    //   }),
    // });
    // let vectorSource = new VectorSource({
    //   features: [markerFeature],
    // });
    // let markerLayer = new VectorLayer({
    //   source: vectorSource,
    // });
    // return markerLayer;

    let vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [circleFeature],
      }),
    });

    return vectorLayer;
  };
}
