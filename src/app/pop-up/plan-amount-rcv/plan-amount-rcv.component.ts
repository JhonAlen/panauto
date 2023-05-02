import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-plan-amount-rcv',
  templateUrl: './plan-amount-rcv.component.html',
  styleUrls: ['./plan-amount-rcv.component.css']
})
export class PlanAmountRcvComponent implements OnInit {

  @Input() public rcv;
  currentUser;
  popup_form: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  canSave: boolean = false;
  isEdit: boolean = false;
  coverageList: any[] = [];
  alert = { show : false, type : "", message : "" }

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.popup_form = this.formBuilder.group({
      mlesioncor: [''],
      mlesioncor_per: [''],
      mdanosp_ajena: [''],
      mgastos_medicos: [''],
      mmuerte: [''],
      mservicios_fune: [''],
      mprima_sin_rep: [''],
      mimpuesto: ['']
    });
    this.canSave = true;
  }

  onSubmit(form){
    this.submitted = true;
    this.loading = true;

    if(this.popup_form.get('mlesioncor').value){
      this.rcv.mlesioncor = this.popup_form.get('mlesioncor').value;
    }else{
      this.rcv.mlesioncor = 0;
    }

    if(this.popup_form.get('mlesioncor_per').value){
      this.rcv.mlesioncor_per = this.popup_form.get('mlesioncor_per').value;
    }else{
      this.rcv.mlesioncor_per = 0;
    }

    if(this.popup_form.get('mdanosp_ajena').value){
      this.rcv.mdanosp_ajena = this.popup_form.get('mdanosp_ajena').value;
    }else{
      this.rcv.mdanosp_ajena = 0;
    }

    if(this.popup_form.get('mgastos_medicos').value){
      this.rcv.mgastos_medicos = this.popup_form.get('mgastos_medicos').value;
    }else{
      this.rcv.mgastos_medicos = 0;
    }

    if(this.popup_form.get('mmuerte').value){
      this.rcv.mmuerte = this.popup_form.get('mmuerte').value;
    }else{
      this.rcv.mmuerte = 0;
    }

    if(this.popup_form.get('mservicios_fune').value){
      this.rcv.mservicios_fune = this.popup_form.get('mservicios_fune').value;
    }else{
      this.rcv.mservicios_fune = 0;
    }

    if(this.popup_form.get('mprima_sin_rep').value){
      this.rcv.mprima_sin_rep = this.popup_form.get('mprima_sin_rep').value;
    }else{
      this.rcv.mprima_sin_rep = 0;
    }

    if(this.popup_form.get('mimpuesto').value){
      this.rcv.mimpuesto = this.popup_form.get('mimpuesto').value;
    }else{
      this.rcv.mimpuesto = 0;
    }
    
    this.activeModal.close(this.rcv);
  }
}