import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanServiceComponent } from '@app/pop-up/plan-service/plan-service.component';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-plan-rcv-detail',
  templateUrl: './plan-rcv-detail.component.html',
  styleUrls: ['./plan-rcv-detail.component.css']
})
export class PlanRcvDetailComponent implements OnInit {

  private serviceGridApi;
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
  rcvList: any[] = [];
  serviceTypeList: any[] = [];
  quantityServiceList: any[] = [];
  showEditButtonService: boolean = false;


  constructor(private formBuilder: UntypedFormBuilder, 
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private modalService : NgbModal) { 
                if (this.router.getCurrentNavigation().extras.state) {
                  
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
      cplan_rc: this.code
    };
    this.http.post(`${environment.apiUrl}/api/plan-rcv/detail`, params, options).subscribe((response : any) => {
      if(response.data.list){
        for(let i = 0; i < response.data.list.length; i++){
          this.rcvList.push({
            xcobertura: response.data.list[i].xcobertura,
            xsoat: response.data.list[i].xsoat
          })
        }
        
        if(this.rcvList[0].xcobertura == 'LESIONES CORPORALES'){
          this.detail_form.get('mlesioncor').setValue(this.rcvList[0].xsoat)
          this.detail_form.get('mlesioncor').disable();
        }

        if(this.rcvList[1].xcobertura == 'LESIONES CORPORALES POR PERSONAS'){
          this.detail_form.get('mlesioncor_per').setValue(this.rcvList[1].xsoat)
          this.detail_form.get('mlesioncor_per').disable();
        }

        if(this.rcvList[2].xcobertura == 'DAÑOS A LA PROPIEDAD AJENA'){
          this.detail_form.get('mdanosp_ajena').setValue(this.rcvList[2].xsoat)
          this.detail_form.get('mdanosp_ajena').disable();
        }

        if(this.rcvList[3].xcobertura == 'GASTOS MEDICOS'){
          this.detail_form.get('mgastos_medicos').setValue(this.rcvList[3].xsoat)
          this.detail_form.get('mgastos_medicos').disable();
        }

        if(this.rcvList[4].xcobertura == 'MUERTE CONDUCTOR / PASAJEROS'){
          this.detail_form.get('mmuerte').setValue(this.rcvList[4].xsoat)
          this.detail_form.get('mmuerte').disable();
        }

        if(this.rcvList[5].xcobertura == 'SERVICIOS FUNERARIOS'){
          this.detail_form.get('mservicios_fune').setValue(this.rcvList[5].xsoat)
          this.detail_form.get('mservicios_fune').disable();
        }

        if(this.rcvList[6].xcobertura == 'PRIMA'){
          this.detail_form.get('mprima').setValue(this.rcvList[6].xsoat)
          this.detail_form.get('mprima').disable();
        }

        this.detail_form.get('xplan_rc').setValue(response.data.xplan_rc)
        this.detail_form.get('xplan_rc').disable();
        this.detail_form.get('mcosto').setValue(response.data.mcosto)
        this.detail_form.get('mcosto').disable();
      }

      this.serviceTypeList = [];
      if(response.data.services){
        for(let i =0; i < response.data.services.length; i++){
          this.serviceTypeList.push({
            cgrid: i,
            create: false,
            ctiposervicio: response.data.services[i].ctiposervicio,
            xtiposervicio: response.data.services[i].xtiposervicio,
          });
        }
      }
      // if(this.serviceTypeList){
      //   this.showEditButtonService = false;
      // }else{
      //   this.showEditButtonService = true;
      // }
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

  addService(){
    let service = { type: 3 };
    const modalRef = this.modalService.open(PlanServiceComponent, {size: 'xl'});
    modalRef.componentInstance.service = service;
    modalRef.result.then((result: any) => { 
      if(result){
        this.serviceTypeList = []; 

        for(let i = 0; i < result.acceptedservice.length; i++){
          this.serviceTypeList.push({
            cgrid: this.serviceTypeList.length,
            create: true,
            ctiposervicio: result.acceptedservice[i].ctiposervicio,
            xtiposervicio: result.acceptedservice[i].xtiposervicio,
          });
        }

        for(let i = 0; i < result.quantity.length; i++){
          this.quantityServiceList.push({
            cgrid: this.quantityServiceList.length,
            create: true,
            ncantidad: result.quantity[i].ncantidad,
            cservicio: result.quantity[i].cservicio,
            xservicio: result.quantity[i].xservicio ,
          });
        }
      }
    });
  }

  onServicesGridReady(event){
    this.serviceGridApi = event.api;
  }

  editPlan(){
    this.detail_form.get('xplan_rc').enable();
    this.detail_form.get('mcosto').enable();
    this.detail_form.get('mlesioncor').enable();
    this.detail_form.get('mlesioncor_per').enable();
    this.detail_form.get('mdanosp_ajena').enable();
    this.detail_form.get('mgastos_medicos').enable();
    this.detail_form.get('mmuerte').enable();
    this.detail_form.get('mservicios_fune').enable();
    this.detail_form.get('mprima').enable();
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
      // {xcobertura: 'PRIMA SIN IMPUESTO', xsoat: this.detail_form.get('mprima_sin_rep').value},
      // {xcobertura: 'IMPUESTO', xsoat: this.detail_form.get('mimpuesto').value},
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
        cplan_rc: this.code,
        datos: this.data,
        cusuario: this.currentUser.data.cusuario,
        xdescripcion: this.detail_form.get('xplan_rc').value,
        mcosto: this.detail_form.get('mcosto').value,
      };
      url = `${environment.apiUrl}/api/plan-rcv/update`;
    }else{
      params = {
        datos: this.data,
        cusuario: this.currentUser.data.cusuario,
        xdescripcion: this.detail_form.get('xplan_rc').value,
        mcosto: this.detail_form.get('mcosto').value,
        servicesType: this.serviceTypeList,
        quantity: this.quantityServiceList,
      }
      url = `${environment.apiUrl}/api/plan-rcv/create`;
    }
    this.http.post(url, params, options).subscribe((response: any) => {
      if(response.data.status){
        if(this.code){
          location.reload();
        }else{
          this.router.navigate([`/products/plan-rcv-detail/${response.data.cplan_rc}`]);
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
