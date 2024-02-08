import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { AppComponent } from './app.component';
import { LoginComponent } from './_components/Login/login.component';
import { MainComponent } from './_components/Main/main.component';
import { DashboardComponent } from './_components/Dashboard/dashboard.component';
import { PatientsComponent } from './_components/Patients/patients.component';
import { PatientmodalComponent } from './_components/PatientModal/patientmodal.component';
import { MappingComponent } from './_components/Mapping/mapping.component';
import { NotFoundComponent } from './_components/NotFound/not-found.component';

import { JwtInterceptor } from './_shared/jwtInterceptor';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PatientmodalviewComponent } from './_components/PatientModalView/patientmodalview.component';
import { MappingpageComponent } from './_components/MappingPage/mappingpage.component';
import { StatisticsComponent } from './_components/Statistics/statistics.component';
import { UsersComponent } from './_components/Users/users.component';
import { UserModalComponent } from './_components/UserModal/usermodal.component';
import { HouseholdsComponent } from './_components/Households/households.component';
import { HouseholdModalComponent } from './_components/HouseholdModal/householdmodal.component';
import { IndividualsComponent } from './_components/Individuals/individuals.component';
import { IndividualModalComponent } from './_components/IndividualModal/individualmodal.component';
import { HouseholdModalViewComponent } from './_components/HouseholdModalView/householdmodalview.component';
import { IndividualModalViewComponent } from './_components/IndividualModalView/individualmodalview.component';
import { CasesComponent } from './_components/Cases/cases.component';
import { CaseModalComponent } from './_components/CaseModal/casemodal.component';
import { CaseMonitoringModalComponent } from './_components/CaseMonitoringModal/casemonitoringmodal.component';
import { CaseModalViewComponent } from './_components/CaseModalView/casemodalview.component';
import { AuthGuard } from './_guard/auth.guard';

const routes: Routes = [
  { path: 'Login', component: LoginComponent, pathMatch: 'full' },
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: ['superadmin', 'admin', 'user'] },
    children: [
      {
        path: '',
        redirectTo: 'Dashboard',
        pathMatch: 'full',
      },
      {
        path: 'Dashboard',
        component: DashboardComponent,
        pathMatch: 'full',
      },
      {
        path: 'Households',
        component: HouseholdsComponent,
        pathMatch: 'full',
      },
      {
        path: 'Population',
        component: IndividualsComponent,
        pathMatch: 'full',
      },
      {
        path: 'Cases',
        component: CasesComponent,
        pathMatch: 'full',
      },
      {
        path: 'Patients',
        component: PatientsComponent,
        pathMatch: 'full',
      },
      {
        path: 'Statistics',
        component: StatisticsComponent,
        pathMatch: 'full',
      },
      {
        path: 'Mapping',
        component: MappingpageComponent,
        pathMatch: 'full',
      },
      {
        path: 'Users',
        component: UsersComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard],
        data: { expectedRole: ['superadmin', 'admin'] },
      },
      { path: '**', component: NotFoundComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    DashboardComponent,
    PatientsComponent,
    NotFoundComponent,
    PatientmodalComponent,
    MappingComponent,
    PatientmodalviewComponent,
    MappingpageComponent,
    StatisticsComponent,
    UsersComponent,
    UserModalComponent,
    HouseholdsComponent,
    HouseholdModalComponent,
    IndividualsComponent,
    IndividualModalComponent,
    HouseholdModalViewComponent,
    IndividualModalViewComponent,
    CasesComponent,
    CaseModalComponent,
    CaseMonitoringModalComponent,
    CaseModalViewComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    NgxSkeletonLoaderModule.forRoot({
      animation: 'progress',
      loadingText: 'This item is actually loading...',
    }),
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSelectModule,
    MatAutocompleteModule,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
