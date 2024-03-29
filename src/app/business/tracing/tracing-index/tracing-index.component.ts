import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-tracing-index',
  templateUrl: './tracing-index.component.html',
  styleUrls: ['./tracing-index.component.css']
})
export class TracingIndexComponent implements OnInit {

  currentUser;
  search_form : UntypedFormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  alert = { show: false, type: "", message: "" };
  fleetNotificationTracingList: any[] = [];
  fleetNotificationTracingListFilter = []
  fleetNotificationThirdpartyTracingList: any[] = [];
  clubServiceRequestTracingList: any[] = [];
  fleetNotificationTracingList2: any[] = [];
  vencimiento : string

  constructor(private formBuilder: UntypedFormBuilder, 
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private router: Router,
              private translate: TranslateService) { }

  ngOnInit(): void {
    this.search_form = this.formBuilder.group({
      xvencimiento: ['']
    });
    this.currentUser = this.authenticationService.currentUserValue;
    if(this.currentUser){
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let options = { headers: headers };
      let params = {
        cusuario: this.currentUser.data.cusuario,
        cmodulo: 91
      }
      this.http.post(`${environment.apiUrl}/api/security/verify-module-permission`, params, options).subscribe((response : any) => {
        if(response.data.status){
          if(!response.data.bindice){
            this.router.navigate([`/permission-error`]);
          }
        }
      },
      (err) => {
        let code = err.error.data.code;
        let message;
        if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
        else if(code == 401){
          let condition = err.error.data.condition;
          if(condition == 'user-dont-have-permissions'){ this.router.navigate([`/permission-error`]); }
        }else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
        this.alert.message = message;
        this.alert.type = 'danger';
        this.alert.show = true;
      });
    }

    this.onSubmit()
  }

  searchTracing(){

    if(this.search_form.get('xvencimiento').value != "TODOS"){
    let id = this.search_form.get('xvencimiento').value
    let Tracing = this.fleetNotificationTracingList
    this.fleetNotificationTracingListFilter = Tracing.filter(data => data.xvencimiento == id)
    } 
    else{
      this.fleetNotificationTracingListFilter = this.fleetNotificationTracingList
    }
    
  }

  getVencimientoCellClass(params ) {
    console.log(params)
    if (params.data.xvencimiento === 'ATRASADOS') {
      return 'btn btn-danger';
    } else if (params.data.xvencimiento === 'VENCER') {
      return 'btn btn-success';
    } else if (params.data.xvencimiento === 'DIA') {
      return 'btn btn-warning';
    }
    return '';
  }

  // editarRenderer  ()  {
  //   const today = new Date();
  //   const day = today.getDate();
  //   const month = today.getMonth() + 1;
  //   const year = today.getFullYear();
    
  //   const formattedDate = year + '-' + month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0');
  
  //   const container = document.createElement('div');
  //   let button;
  //   let color;
  //   let text;
  
  //   if (this.search_form.get('xvencimiento').value == 'DIA') {
  //     button = document.createElement('button');
  //     button.className = 'btn btn-warning';
  //     color = 'btn btn-warning';
  //     text = '';
  //   } else if (this.search_form.get('xvencimiento').value == 'ATRASADOS') {
  //     button = document.createElement('button');
  //     button.className = 'btn btn-danger';
  //     color = 'btn btn-danger';
  //     text = '';
  //   } else if (this.search_form.get('xvencimiento').value == 'VENCER') {
  //     button = document.createElement('button');
  //     button.className = 'btn btn-success';
  //     color = 'btn btn-success';
  //     text = '';
  //   } else if (this.search_form.get('xvencimiento').value == 'TODOS') {

  //     if (this.fleetNotificationTracingList) {

  //       for (let i = 0; i < this.fleetNotificationTracingList.length; i++) {

  //         if (this.fleetNotificationTracingList[i].xvencimiento  == 'DIA') {
  //           button = document.createElement('button');
  //           color = 'btn btn-warning';
  //           text = '';
      
  //         }  if (this.fleetNotificationTracingList[i].xvencimiento  == 'ATRASADOS') {
  //           button = document.createElement('button');
  //           color = 'btn btn-danger';
  //           text = '';
          
  //         }  if (this.fleetNotificationTracingList[i].xvencimiento > formattedDate) {
  //           button = document.createElement('button');
  //           color = 'btn btn-success';
  //           text = '';
  
  //         }
  //       }
  //     }
  //   }
  
  //   button.textContent = text;
  //   button.className = color;
  //   container.appendChild(button);
  
  //   return container;
  // }

  onSubmit(){
    this.submitted = true;
    this.loading = true;

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      ccompania: this.currentUser.data.ccompania,
      cusuario: this.currentUser.data.cusuario,
      ccanal: this.currentUser.data.ccanal
    }
    this.fleetNotificationTracingList = [];
    this.http.post(`${environment.apiUrl}/api/tracing/search`, params, options).subscribe((response : any) => {
      if (response.data.status) {
        for (let i = 0; i < response.data.list.length; i++) {

          this.fleetNotificationTracingList.push({
            cnotificacion: response.data.list[i].cnotificacion,
            xtiposeguimiento: response.data.list[i].xtiposeguimiento,
            xmotivoseguimiento: response.data.list[i].xmotivoseguimiento,
            bcerrado: response.data.list[i].bcerrado,
            xobservacion: response.data.list[i].xobservacion,
            fseguimiento: response.data.list[i].fseguimiento,
            xvencimiento : response.data.list[i].xvencimiento,
          });
        }
      }
      this.loading = false;
    },
    (err) => {
      let code = err.error.data.code;
      let message;
      if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
      else if(code == 404){ message = "HTTP.ERROR.CLUBCONTRACTSMANAGEMENT.CLUBCONTRACTNOTFOUND"; }
      else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
      this.alert.message = message;
      this.alert.type = 'danger';
      this.alert.show = true;
      this.loading = false;
    });
  }

  fleetNotificationTracingRowClicked(event: any){
    this.router.navigate([`events/notification-detail/${event.data.cnotificacion}`]);
  }

  fleetNotificationThirdpartyTracingRowClicked(event: any){
    this.router.navigate([`events/notification-detail/${event.data.cnotificacion}`]);
  }

  clubServiceRequestTracingRowClicked(event: any){
    this.router.navigate([`events/service-request-detail/${event.data.csolicitudservicio}`]);
  }

}
