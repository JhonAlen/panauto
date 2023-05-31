import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NumberOfServiceComponent } from '@app/pop-up/number-of-service/number-of-service.component';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-plan-service',
  templateUrl: './plan-service.component.html',
  styleUrls: ['./plan-service.component.css']
})
export class PlanServiceComponent implements OnInit {

  @Input() public service;
  private coverageGridApi;
  private serviceTypeGridApi;
  private acceptedServiceTypeGridApi;
  currentUser;
  popup_form: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  canSave: boolean = false;
  isEdit: boolean = false;
  coverageList: any[] = [];
  serviceList: any[] = [];
  serviceTypeList: any[] = [];
  serviceDepletionTypeList: any[] = [];
  alert = { show : false, type : "", message : "" }
  coverageDeletedRowList: any[] = [];
  acceptedserviceTypeList;
  quantityList: any[] = [];
  List: any[] = [];
  bcrear: boolean = false;
  bconsultar: boolean = false;
  beditar: boolean = false;
  quantityUpdateList: any[] = [];

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.popup_form = this.formBuilder.group({
      ctiposervicio: [''],
      cservicio: [''],
      ctipoagotamientoservicio: [''],
      ncantidad: [''],
      pservicio: [''],
      mmaximocobertura: [''],
      mdeducible: [''],
      bserviciopadre: [false]
    });
    this.currentUser = this.authenticationService.currentUserValue;
    if(this.currentUser){
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let options = { headers: headers };
      let params = {
        cpais: this.currentUser.data.cpais,
        ccompania: this.currentUser.data.ccompania
      };
      this.http.post(`${environment.apiUrl}/api/valrep/service-type`, params, options).subscribe((response : any) => {
        if(response.data.status){
          this.serviceTypeList = [];
          for(let i = 0; i < response.data.list.length; i++){
            this.serviceTypeList.push({ ctiposervicio: response.data.list[i].ctiposervicio, xtiposervicio: response.data.list[i].xtiposervicio });
          }
          this.serviceTypeList.sort((a,b) => a.xtiposervicio > b.xtiposervicio ? 1 : -1);
        }
      },
      (err) => {
        let code = err.error.data.code;
        let message;
        if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
        else if(code == 404){ message = "HTTP.ERROR.VALREP.SERVICETYPENOTFOUND"; }
        else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
        this.alert.message = message;
        this.alert.type = 'danger';
        this.alert.show = true;
      });
          // Pasar valores a la lista
        let arrayPerform = this.serviceTypeList;
        arrayPerform = arrayPerform.filter((obj) => !obj.ctiposervicio);
        for(let i = 0; i < arrayPerform.length; i ++){
          arrayPerform[i].cgrid = i; 
          arrayPerform[i].baceptado = 0; 
        }
        
        arrayPerform = this.serviceTypeList;
        this.acceptedserviceTypeList = arrayPerform;

      if(this.service){
        if(this.service.type == 3){
          this.canSave = false;
          this.bcrear = true;
        }else if(this.service.type == 2){
          this.searchPlanTypeSelected();
          this.coverageList = this.service.coverages
          this.canSave = false;
          this.bconsultar = true;
        }else if(this.service.type == 1){
          this.searchPlanTypeSelected();
          this.isEdit = true;
          this.canSave = false;
          this.beditar = true;
        }
      }
    }
  }

  serviceTypeRowClicked(event: any){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      ctiposervicio: event.data.ctiposervicio
    };
    this.http.post(`${environment.apiUrl}/api/plan/search-service`, params, options).subscribe((response : any) => {
      if(response.data.status){
        this.serviceList = [];
        for(let i = 0; i < response.data.list.length; i++){
          this.serviceList.push({ cservicio: response.data.list[i].cservicio, xservicio: response.data.list[i].xservicio });
        }
        this.serviceList.sort((a,b) => a.xservicio > b.xservicio ? 1 : -1);
      }
    },
    (err) => {
      let code = err.error.data.code;
      let message;
      if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
      else if(code == 404){ message = "HTTP.ERROR.VALREP.SERVICETYPENOTFOUND"; }
      else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
      this.alert.message = message;
      this.alert.type = 'danger';
      this.alert.show = true;
    });
    let eventObj = event.data;
    this.serviceTypeList = this.serviceTypeList.filter((obj) => obj.ctiposervicio != eventObj.ctiposervicio)
    this.serviceTypeGridApi.setRowData(this.serviceTypeList);
    this.acceptedserviceTypeList.push(eventObj);
    for(let i = 0; i < this.acceptedserviceTypeList.length; i++){
      this.acceptedserviceTypeList[i].cgrid = i;
      this.acceptedserviceTypeList[i].ctiposervicio;
      this.acceptedserviceTypeList[i].xtiposervicio;
      this.acceptedserviceTypeList[i].baceptado = 1;
    }
    if(this.acceptedserviceTypeList[0]){
      this.canSave = true;
    }
    this.acceptedServiceTypeGridApi.setRowData(this.acceptedserviceTypeList);
    this.quantityList = [];
}

numberServiceRowClicked(event: any){
  let quantity = { type: 2, cservicio: event.data.cservicio, xservicio: event.data.xservicio };
  const modalRef = this.modalService.open(NumberOfServiceComponent);
  modalRef.componentInstance.quantity = quantity;
  modalRef.result.then((result: any) => { 
    if(result){
      for(let i = 0; i < result.length; i++){
        this.List.push({
          ncantidad: result[i].ncantidad,
          cservicio: result[i].cservicio,
          xservicio: result[i].xservicio,
          pservicio: result[i].pservicio,
          mmaximocobertura: result[i].mmaximocobertura,
          mdeducible: result[i].mdeducible,
          baceptado: result[i].baceptado
        })
      } 
      this.quantityList = []
      for(let i = 0; i < this.List.length; i++){
        this.quantityList.push({
          ncantidad: this.List[i].ncantidad,
          cservicio: this.List[i].cservicio,
          xservicio: this.List[i].xservicio,
          pservicio: this.List[i].pservicio,
          mmaximocobertura: this.List[i].mmaximocobertura,
          mdeducible: this.List[i].mdeducible,
          baceptado: this.List[i].baceptado,
        })
      } 
    }
  });
}

searchPlanTypeSelected(){
  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  let options = { headers: headers };
  let params = {
    cplan: this.service.cplan,
    baceptado: 1
  };
  this.http.post(`${environment.apiUrl}/api/plan/search-type-service-selected`, params, options).subscribe((response : any) => {
    if(response.data.status){
      this.acceptedserviceTypeList = [];
      for(let i = 0; i < response.data.list.length; i++){
        this.acceptedserviceTypeList.push({ 
          ctiposervicio: response.data.list[i].ctiposervicio, 
          xtiposervicio: response.data.list[i].xtiposervicio });
      }
      this.acceptedserviceTypeList.sort((a,b) => a.xtiposervicio > b.xtiposervicio ? 1 : -1);
    }
  },
  (err) => {
    let code = err.error.data.code;
    let message;
    if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
    else if(code == 404){ message = "HTTP.ERROR.VALREP.SERVICETYPENOTFOUND"; }
    else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
    this.alert.message = message;
    this.alert.type = 'danger';
    this.alert.show = true;
  });
  this.http.post(`${environment.apiUrl}/api/plan/search-service-selected`, params, options).subscribe((response : any) => {
    if(response.data.status){
      this.quantityList = [];
      for(let i = 0; i < response.data.list.length; i++){
        this.quantityList.push({ 
          cservicio: response.data.list[i].cservicio, 
          xservicio: response.data.list[i].xservicio,
          ncantidad: response.data.list[i].ncantidad
        });
      }
      this.quantityList.sort((a,b) => a.xservicio > b.xservicio ? 1 : -1);
    }
  },
  (err) => {
    let code = err.error.data.code;
    let message;
    if(code == 400){ message = "HTTP.ERROR.PARAMSERROR"; }
    else if(code == 404){ message = "HTTP.ERROR.VALREP.SERVICETYPENOTFOUND"; }
    else if(code == 500){  message = "HTTP.ERROR.INTERNALSERVERERROR"; }
    this.alert.message = message;
    this.alert.type = 'danger';
    this.alert.show = true;
  });
}

  editarRenderer = (params: any) => {
    const button = document.createElement('button');
    button.className = 'btn btn-success';
    button.textContent = 'Editar';
    button.addEventListener('click', () => this.editService(params.data.cservicio));

    const container = document.createElement('div');
    container.appendChild(button);

    return container;
  }

  editService(cservicio: number) {
    let quantity = {};
    if(this.service.type == 1){ 
      quantity = { 
        type: 1,
        cservicio: cservicio,
        cplan: this.service.cplan,
        delete: false
      };
    }
    const modalRef = this.modalService.open(NumberOfServiceComponent);
    modalRef.componentInstance.quantity = quantity;
    modalRef.result.then((result: any) => {
      if(result){
        this.canSave = true;
        for(let i = 0; i < result.length; i++){
          this.List.push({
            ncantidad: result[i].ncantidad,
            cservicio: result[i].cservicio,
            pservicio: result[i].pservicio,
            mmaximocobertura: result[i].mmaximocobertura,
            mdeducible: result[i].mdeducible,
            baceptado: result[i].baceptado
          })
        } 
        this.quantityUpdateList = []
        for(let i = 0; i < this.List.length; i++){
          this.quantityUpdateList.push({
            ncantidad: this.List[i].ncantidad,
            cservicio: this.List[i].cservicio,
            pservicio: this.List[i].pservicio,
            mmaximocobertura: this.List[i].mmaximocobertura,
            mdeducible: this.List[i].mdeducible,
            baceptado: this.List[i].baceptado,
          })
        } 
      }
    });
  }

  onServiceTypeGridReady(event){
    this.serviceTypeGridApi = event.api;
  }

  onAcceptedServiceTypeGridReady(event){
    this.acceptedServiceTypeGridApi = event.api;
  }

  onSubmit(form){
    this.submitted = true;
    this.loading = true;

    let servicios = {};

    if(this.service.type == 3){
      servicios = {
        acceptedservice: this.acceptedserviceTypeList,
        quantity: this.quantityList
      }
    }else if(this.service.type == 1){
      servicios = {
        acceptedservice: this.acceptedserviceTypeList,
        quantity: this.quantityUpdateList
      }
    }

    this.service = servicios;

    this.activeModal.close(this.service);
  }
}