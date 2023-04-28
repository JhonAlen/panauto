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

  lesionesCorp: number;
  lesionesCorpPorPers: number;
  danosPropAjena: number;
  gastosMedicos: number;
  muerteCondPasaj: number;
  servFunerarios: number;
  primaSinImp: number;
  impuesto: number;
  prima: number;

  datos: any[] = [];
  registros: any[] = [];

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.popup_form = this.formBuilder.group({
      msuma_dc: [''],
      msuma_personas: [''],
      msuma_exceso: [''],
      msuma_dp: [''],
      msuma_muerte: [''],
      msuma_invalidez: [''],
      msuma_gm: [''],
      msuma_gf: ['']
    });
    this.canSave = true;
  }

  actualizarDato(dato: any, valor: string) {
    // dato.monto = parseFloat(nuevoValor) || 0; // parseamos el valor a un número
    // const valorGuardado = `${dato.nombre}: ${dato.monto}`; // generamos el valor guardado
    // this.valoresGuardados.push(valorGuardado);
    // console.log(this.valoresGuardados)

    const monto = parseFloat(valor) || 0; // Convertir a número o establecer en cero si no se puede
    dato.monto = monto;
  
    const nuevoRegistro = { nombre: dato.nombre, monto: monto };
    this.registros.push(nuevoRegistro);
    console.log(this.registros)
  }

  onSubmit(form){
    this.submitted = true;
    this.loading = true;


    console.log(form)
    
    this.activeModal.close(this.rcv);
  }
}