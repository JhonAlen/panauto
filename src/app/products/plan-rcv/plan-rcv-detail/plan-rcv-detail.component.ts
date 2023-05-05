import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-plan-rcv-detail',
  templateUrl: './plan-rcv-detail.component.html',
  styleUrls: ['./plan-rcv-detail.component.css']
})
export class PlanRcvDetailComponent implements OnInit {

  sub;
  currentUser;
  detail_form: UntypedFormGroup;
  loading: boolean = false;
  loading_cancel: boolean = false;
  submitted: boolean = false;
  alert = { show: false, type: "", message: "" };
  planTypeList: any[] = [];
  paymentMethodologyList: any[] = [];
  insurerList: any[] = [];
  serviceList: any[] = [];
  serviceInsurerList: any[] = [];
  canCreate: boolean = false;
  canDetail: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  code;
  showSaveButton: boolean = false;
  showEditButton: boolean = false;
  editStatus: boolean = false;
  data: any[] = [];
  ctarifa;

  constructor(private formBuilder: UntypedFormBuilder, 
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private modalService : NgbModal) { 
                if (this.router.getCurrentNavigation().extras.state) {
                  this.ctarifa = this.router.getCurrentNavigation().extras.state; 
                }
              }

  ngOnInit(): void {
    this.detail_form = this.formBuilder.group({
      xplan_rc: [''],
      mcosto: [''],
      mlesioncor: [''],
      mlesioncor_per: [''],
      mdanosp_ajena: [''],
      mgastos_medicos: [''],
      mmuerte: [''],
      mservicios_fune: [''],
      mprima_sin_rep: [''],
      mimpuesto: [''],
      mprima: ['']
    });
    this.currentUser = this.authenticationService.currentUserValue;
    if(this.currentUser){
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let options = { headers: headers };
      let params = {
        cusuario: this.currentUser.data.cusuario,
        cmodulo: 108
      }
      this.http.post(`${environment.apiUrl}/api/security/verify-module-permission`, params, options).subscribe((response : any) => {
        if(response.data.status){
          this.canCreate = response.data.bcrear;
          this.canDetail = response.data.bdetalle;
          this.canEdit = response.data.beditar;
          this.canDelete = response.data.beliminar;
          this.initializeDetailModule();
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
  }

  initializeDetailModule(){
    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.code = params.get('id');
      if(this.code){
        if(!this.canDetail){
          this.router.navigate([`/permission-error`]);
          return;
        }
        this.getPlanData();
        if(this.canEdit){ this.showEditButton = true; }
      }else{
        if(!this.canCreate){
          this.router.navigate([`/permission-error`]);
          return;
        }
        this.editStatus = true;
        this.showSaveButton = true;
      }
    });
  }  

  getPlanData(){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      cplan_rc: this.code,
      ctarifa: this.ctarifa
    };
    this.http.post(`${environment.apiUrl}/api/plan-rcv/detail`, params, options).subscribe((response : any) => {
      if(response.data.status){
        this.detail_form.get('xplan_rc').setValue(response.data.xplan_rc);
        this.detail_form.get('xplan_rc').disable();
        this.detail_form.get('ctarifa').setValue(response.data.ctarifa);
        this.detail_form.get('ctarifa').disable();
        this.detail_form.get('xclase').setValue(response.data.xclase);
        this.detail_form.get('xclase').disable();
        this.detail_form.get('xtipo').setValue(response.data.xtipo);
        this.detail_form.get('xtipo').disable();
        this.detail_form.get('xgrupo').setValue(response.data.xgrupo);
        this.detail_form.get('xgrupo').disable();
        this.detail_form.get('msuma_cosas_rc').setValue(response.data.msuma_cosas_rc);
        this.detail_form.get('msuma_cosas_rc').disable();
        this.detail_form.get('msuma_personas_rc').setValue(response.data.msuma_personas_rc);
        this.detail_form.get('msuma_personas_rc').disable();
        this.detail_form.get('mprima_rc').setValue(response.data.mprima_rc);
        this.detail_form.get('mprima_rc').disable();
        this.detail_form.get('msuma_defensa_per').setValue(response.data.msuma_defensa_per);
        this.detail_form.get('msuma_defensa_per').disable();
        this.detail_form.get('mprima_defensa_per').setValue(response.data.mprima_defensa_per);
        this.detail_form.get('mprima_defensa_per').disable();
        this.detail_form.get('msuma_limite_ind').setValue(response.data.msuma_limite_ind);
        this.detail_form.get('msuma_limite_ind').disable();
        this.detail_form.get('mprima_limite_ind').setValue(response.data.mprima_limite_ind);
        this.detail_form.get('mprima_limite_ind').disable();
        this.detail_form.get('msuma_apov_mu').setValue(response.data.msuma_apov_mu);
        this.detail_form.get('msuma_apov_mu').disable();
        this.detail_form.get('mapov_mu').setValue(response.data.mapov_mu);
        this.detail_form.get('mapov_mu').disable();
        this.detail_form.get('msuma_apov_in').setValue(response.data.msuma_apov_in);
        this.detail_form.get('msuma_apov_in').disable();
        this.detail_form.get('mapov_in').setValue(response.data.mapov_in);
        this.detail_form.get('mapov_in').disable();
        this.detail_form.get('msuma_apov_ga').setValue(response.data.msuma_apov_ga);
        this.detail_form.get('msuma_apov_ga').disable();
        this.detail_form.get('mapov_ga').setValue(response.data.mapov_ga);
        this.detail_form.get('mapov_ga').disable();
        this.detail_form.get('msuma_apov_fu').setValue(response.data.msuma_apov_fu);
        this.detail_form.get('msuma_apov_fu').disable();
        this.detail_form.get('mapov_fu').setValue(response.data.mapov_fu);
        this.detail_form.get('mapov_fu').disable();
      }
    },
    (err) => {
      let code = err.error.data.code;
      let message;
      if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
      else if(code == 404){ message = "HTTP.ERROR.VALREP.PLANTYPENOTFOUND"; }
      else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
      this.alert.message = message;
      this.alert.type = 'danger';
      this.alert.show = true;
    });
  }

  editPlan(){
    this.detail_form.get('xplan_rc').enable();
    this.detail_form.get('xclase').enable();
    this.detail_form.get('xtipo').enable();
    this.detail_form.get('xgrupo').enable();
    this.detail_form.get('msuma_cosas_rc').enable();
    this.detail_form.get('msuma_personas_rc').enable();
    this.detail_form.get('mprima_rc').enable();
    this.detail_form.get('msuma_defensa_per').enable();
    this.detail_form.get('mprima_defensa_per').enable();
    this.detail_form.get('msuma_limite_ind').enable();
    this.detail_form.get('mprima_limite_ind').enable();
    this.detail_form.get('msuma_apov_ga').enable();
    this.detail_form.get('msuma_apov_mu').enable();
    this.detail_form.get('mapov_mu').enable();
    this.detail_form.get('msuma_apov_in').enable();
    this.detail_form.get('mapov_in').enable();
    this.detail_form.get('mapov_ga').enable();
    this.detail_form.get('msuma_apov_fu').enable();
    this.detail_form.get('mapov_fu').enable();
    this.showEditButton = false;
    this.showSaveButton = true;
    this.editStatus = true;
  }

  amount(){
    if(!this.detail_form.get('mcosto').value){
      this.detail_form.get('mcosto').setValue(this.detail_form.get('mprima').value);
      this.detail_form.get('mcosto').disable();
    }
  }

  cancelSave(){
    if(this.code){
      this.loading_cancel = true;
      this.showSaveButton = false;
      this.showEditButton = true;
      this.editStatus = false;
      this.getPlanData();
    }else{
      this.router.navigate([`/products/plan-rcv-index`]);
    }
  }

  convertCamp() {
    const coberturas = [
      {xcobertura: 'LESIONES CORPORALES', xsoat: this.detail_form.get('mlesioncor').value},
      {xcobertura: 'LESIONES CORPORALES POR PERSONAS', xsoat: this.detail_form.get('mlesioncor_per').value},
      {xcobertura: 'DAÑOS A LA PROPIEDAD AJENA', xsoat: this.detail_form.get('mdanosp_ajena').value},
      {xcobertura: 'GASTOS MEDICOS', xsoat: this.detail_form.get('mgastos_medicos').value},
      {xcobertura: 'MUERTE CONDUCTOR / PASAJEROS', xsoat: this.detail_form.get('mmuerte').value},
      {xcobertura: 'SERVICIOS FUNERARIOS', xsoat: this.detail_form.get('mservicios_fune').value},
      {xcobertura: 'PRIMA SIN IMPUESTO', xsoat: this.detail_form.get('mprima_sin_rep').value},
      {xcobertura: 'IMPUESTO', xsoat: this.detail_form.get('mimpuesto').value},
      {xcobertura: 'PRIMA', xsoat: this.detail_form.get('mprima').value}
    ];
  
    const data = [];
  
    for (const cobertura of coberturas) {
      const valor = cobertura.xsoat ? cobertura.xsoat : 0;
      data.push({
        xcobertura: cobertura.xcobertura,
        xsoat: valor
      });
    }
  
    this.data.push(...data);

    if(this.data){
      this.onSubmit();
    }

  }

  onSubmit(){
    this.submitted = true;
    this.loading = true;

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params;
    let url;

    if(this.code){
      params = {
      };
      url = `${environment.apiUrl}/api/plan-rcv/update`;
    }else{
      params = {
        datos: this.data,
        cusuario: this.currentUser.data.cusuario,
        xdescripcion: this.detail_form.get('xplan_rc').value,
        mcosto: this.detail_form.get('mcosto').value,
      }
      url = `${environment.apiUrl}/api/plan-rcv/create`;
    }
    this.http.post(url, params, options).subscribe((response: any) => {
      if(response.data.status){
        if(this.code){
          location.reload();
        }else{
          console.log(response.data.cplan_rc)
          this.router.navigate([`/plan-rcv/plan-rcv-detail/${response.data.cplan_rc}`]);
        }
      }else{
        let condition = response.data.condition;
        if(condition == "service-order-already-exist"){
          this.alert.message = "EVENTS.SERVICEORDER.NAMEREADYEXIST";
          this.alert.type = 'danger';
          this.alert.show = true;
        }
      }
      this.loading = false;
    },
    (err) => {
      let code = 1;
      let message;
      if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
      else if(code == 404){ message = "HTTP.ERROR.THIRDPARTIES.ASSOCIATENOTFOUND"; }
      //else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
      this.alert.message = message;
      this.alert.type = 'danger';
      this.alert.show = true;
      this.loading = false;
    });
  }
}
