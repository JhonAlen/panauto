import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-number-of-service',
  templateUrl: './number-of-service.component.html',
  styleUrls: ['./number-of-service.component.css']
})
export class NumberOfServiceComponent implements OnInit {

  @Input() public quantity;
  currentUser;
  popup_form: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  canSave: boolean = false;
  isEdit: boolean = false;
  coverageList: any[] = [];
  serviceList: any[] = [];
  alert = { show : false, type : "", message : "" }

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.popup_form = this.formBuilder.group({
      ncantidad: [''],
      pservicio: [''],
      mmaximocobertura: [''],
      mdeducible: [''],
    });

    if(this.quantity){
      if(this.quantity.type == 2){
        this.canSave = true;
      }else{
        this.searchQuantity();
        this.canSave = true;
      }
    }
  }

  searchQuantity(){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      cplan: this.quantity.cplan,
      cservicio: this.quantity.cservicio
    };
    this.http.post(`${environment.apiUrl}/api/plan/search-quantity`, params, options).subscribe((response : any) => {
      if(response.data.status){
        this.popup_form.get('ncantidad').setValue(response.data.ncantidad);
        this.popup_form.get('pservicio').setValue(response.data.pservicio);
        this.popup_form.get('mmaximocobertura').setValue(response.data.mmaximocobertura);
        this.popup_form.get('mdeducible').setValue(response.data.mdeducible);
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

  onSubmit(form){
    this.submitted = true;
    this.loading = true;

    let cantidad = []
    
    cantidad.push({
      cservicio: this.quantity.cservicio,
      xservicio: this.quantity.xservicio,
      baceptado: 1,
      ncantidad: form.ncantidad,
      pservicio: form.pservicio,
      mmaximocobertura: form.mmaximocobertura,
      mdeducible: form.mdeducible,
    })

    this.quantity = cantidad;
    
    this.activeModal.close(this.quantity);
  }

}
