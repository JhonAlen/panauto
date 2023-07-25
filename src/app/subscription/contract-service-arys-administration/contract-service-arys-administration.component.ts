import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators , FormBuilder} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication.service';
import { environment } from '@environments/environment';
import { GridApi } from 'ag-grid-community';
import { NgbPaginationModule, NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CauseForCancellationComponent } from '@app/pop-up/cause-for-cancellation/cause-for-cancellation.component';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-contract-service-arys-administration',
  templateUrl: './contract-service-arys-administration.component.html',
  styleUrls: ['./contract-service-arys-administration.component.css']
})
export class ContractServiceArysAdministrationComponent implements OnInit {

  currentUser;
  keyword = 'value';
  search_form : UntypedFormGroup;
  searchStatus: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  alert = { show: false, type: "", message: "" };
  contractList: any[] = [];
  batchList: any[] = [];
  fleetContractList: any[] = [];
  xlogo: string;
  id: number;
  xcliente: string;
  xdocidentidadcliente: number;
  xemailcliente: string;
  xpropietario: string;
  xdocidentidadpropietario: number;
  xemailpropietario: string;
  xplaca: string;
  xmarca: string;
  xmodelo: string;
  xversion: string;
  fano: number;
  xserialcarroceria: string;
  xserialmotor: string;
  xcolor: string;
  ncapacidadpasajeros: number;
  mtotal: number;
  fdesde;
  fhasta;
  canCreate: boolean = false;
  canDetail: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  filteredData;
  public page = 1;
  public pageSize = 7;
  ccontratoflota: number;
  ccarga: number;
  mprimatotal: number;
  mprimaprorratatotal: number;
  xpoliza: string;
  xrecibo: string;
  fdesde_rec: Date;
  fhasta_rec: Date;
  femision: Date;
  fsuscripcion: Date;
  fnacimientopropietario2: string;
  xnombrecliente: string;
  xdireccionfiscalcliente: string;
  xtelefonocliente: string;
  xrepresentantecliente: string;
  xciudadcliente: string;
  xestadocliente: string;
  showSaveButton: boolean = false;
  showEditButton: boolean = false;
  editStatus: boolean = false;
  accesoryDeletedRowList: any[] = [];
  inspectionDeletedRowList: any[] = [];
  planCoberturas: string;
  planServicios: string;
  xtituloreporte: string;
  xobservaciones: string;
  xnombrerepresentantelegal: string;
  xdocidentidadrepresentantelegal: string;
  xanexo: string;
  cstatuspoliza: number;
  rowClick: boolean = false;
  cuadro: boolean = false;
  coverage = {};
  xtomador : string;
  xprofesion : string;
  xrif;
  xdomicilio : string;
  xzona_postal : string;
  
  xtelefono : string;
  xcorreo : string;
  xestado : string;
  xciudad : string;



  ccontratoflora: number;
  xsucursalsuscriptora: string;
  xsucursalemision: string;
  ccorredor: number;
  xcorredor: string;
  xnombrepropietario: string;
  xapellidopropietario: string;
  xtipodocidentidadpropietario: string;
  xtelefonocelularpropietario: string;
  xdireccionpropietario: string;
  xestadopropietario: string;
  xciudadpropietario: string;
  xestadocivilpropietario: string;
  xocupacionpropietario: string;
  fnacimientopropietario: string
  cmetodologiapago: number;
  xtelefonopropietario: string;
  cvehiculopropietario: number;
  ctipoplan: number;
  cplan: number;
  ctiporecibo: number;
  mpreciovehiculo: number;
  ctipovehiculo: number;
  xdocidentidadcorredor: number;
  xtelefonocorredor: number;
  xtipomodelovehiculo: string;
  ncapacidadcargavehiculo: number;
  ncapacidadpasajerosvehiculo: number;
  xplancoberturas: string;
  xplanservicios: string;
  xnombrecorredor: string;
  modalidad: boolean = true;
  montorcv: boolean = true;
  cobertura: boolean = false;
  grua: boolean = false;
  xuso: any;
  xtipovehiculo: any;
  xclase: any;
  xtransmision: any;
  xzona_postal_propietario: any;
  nkilometraje: any;
  xmoneda;
  mmonto_plan;
  serviceList = [];
  cancellationData: {};
  banular: boolean = false;
  estatus;
  serviceTypeList: any[] = [];

  constructor(private formBuilder: UntypedFormBuilder,
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private router: Router,
              private modalService : NgbModal) { }

  async ngOnInit(): Promise<void>{
    this.search_form = this.formBuilder.group({
      xnombre: [''],
      xapellido: [''],
      cano: [''],
      xcolor: [''],
      cmarca: [''],
      cmodelo: [''],
      cversion: [''],
      xrif_cliente:[''],
      email: [''],
      xtelefono_prop:[''],
      xdireccionfiscal: [''],
      xserialmotor: [''],
      xserialcarroceria: [''],
      xplaca: [''],
      xtelefono_emp: [''],
      cplan: [''],
      ncapacidad_p: [''],
      cestado:[''],
      cciudad:[''],
      icedula:[''],
      femision:[''],
      ivigencia:[''],
      cpais:[''],
      xreferencia:[''],
      fcobro:[''],
      cbanco: [''],
      xcedula: [''],
      binternacional: [''],
      ctomador: [''],
      cuso: [''],
      cclase: [''],
      ctipovehiculo: [''],
      xzona_postal:[''],
      nkilometraje: [''],
      xmoneda: [''],
    });
    
    this.currentUser = this.authenticationService.currentUserValue;

    if(this.currentUser){
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let options = { headers: headers };
      let params = {
        cusuario: this.currentUser.data.cusuario,
        cmodulo: 120
      }
      this.http.post(`${environment.apiUrl}/api/security/verify-module-permission`, params, options).subscribe((response : any) => {
        if(response.data.status){
          this.canCreate = response.data.bcrear;
          this.canDetail = response.data.bdetalle;
          this.canEdit = response.data.beditar;
          this.canDelete = response.data.beliminar;
          this.initializeDropdownDataRequest();
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

  initializeDropdownDataRequest(){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      ccanal: this.currentUser.data.ccanal
    };
    this.http.post(`${environment.apiUrl}/api/contract-arys/search-contract-arys`, params, options).subscribe((response : any) => {
      this.contractList = [];
      if(response.data.status){
        for(let i = 0; i < response.data.list.length; i++){
          let estadoContrato = response.data.list[i].xestadocontrato;
          let puedeAnular = estadoContrato === 'Vigente'; // establece la propiedad "puedeAnular" en verdadero si el estado del contrato es "Vigente", y en falso si es "Anulado"
          this.contractList.push({
            ccontratoflota: response.data.list[i].ccontratoflota,
            xnombres: response.data.list[i].xnombres,
            xvehiculo: response.data.list[i].xvehiculo,
            fano: response.data.list[i].fano,
            identificacion: response.data.list[i].identificacion,
            xplaca: response.data.list[i].xplaca,
            xestadocontrato: estadoContrato,
            puedeAnular: puedeAnular // agrega la propiedad "puedeAnular" al objeto del contrato
          });
        }
        this.filteredData = this.contractList;
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

  filterData(value: string) {
    this.filteredData = this.contractList.filter((item) => {
      const searchValue = value.toLowerCase();
      const nombres = item.xnombres ? item.xnombres.toString().toLowerCase() : '';
      const vehiculo = item.xvehiculo ? item.xvehiculo.toString().toLowerCase() : '';
      const identificacion = item.identificacion ? item.identificacion.toString().toLowerCase() : '';
      const placa = item.xplaca ? item.xplaca.toString().toLowerCase() : '';
  
      return nombres.includes(searchValue) || vehiculo.includes(searchValue) || identificacion.includes(searchValue) || placa.includes(searchValue);
    });
  }

  changeDateFormat(date) {
    if (date) {
      let dateArray = date.substring(0,10).split("-");
      return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
    }
    else {
      return ' ';
    }
  }

  getContractArysFromCertificate(ccontratoflota){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      cpais: this.currentUser.data.cpais,
      ccompania: this.currentUser.data.ccompania,
      ccontratoflota: ccontratoflota,
      ccanal: this.currentUser.data.ccanal
    };
    this.http.post(`${environment.apiUrl}/api/contract-arys/detail-contract-arys`, params, options).subscribe((response : any) => {
      this.contractList = [];
      if(response.data.status){
        this.xlogo = response.data.xlogo;
        this.ccontratoflota = response.data.ccontratoflota;
        this.ccarga = response.data.ccarga;
        this.xpoliza = response.data.xpoliza;
        this.xtituloreporte = response.data.xtituloreporte;
        this.xanexo = response.data.xanexo;
        this.xobservaciones = response.data.xobservaciones;
        this.xnombrerepresentantelegal = response.data.xnombrerepresentantelegal;
        this.xdocidentidadrepresentantelegal = response.data.xdocidentidadrepresentantelegal;
        this.xnombrecliente = response.data.xnombrecliente;
        this.xdocidentidadcliente = response.data.xdocidentidadcliente;
        this.xdireccionfiscalcliente = response.data.xdireccionfiscalcliente;
        this.xciudadcliente = response.data.xciudadcliente;
        this.xestadocliente = response.data.xestadocliente;
        if (response.data.xtelefonocliente) {
          this.xtelefonocliente = response.data.xtelefonocliente;
        } else {
          this.xtelefonocliente = ' ';
        }
        if (response.data.xemailcliente) {
          this.xemailcliente = response.data.xemailcliente;
        } else {
          this.xemailcliente = ' ';
        }
        if (response.data.xrepresentantecliente) {
          this.xrepresentantecliente = response.data.xrepresentantecliente;
        } else {
          this.xrepresentantecliente = ' ';
        }
        this.xsucursalemision = response.data.xsucursalemision;
        this.xsucursalsuscriptora = response.data.xsucursalsuscriptora;
        this.ccorredor = response.data.ccorredor;
        this.xnombrecorredor = response.data.xcanal;
        this.xnombrepropietario = response.data.xnombrepropietario;
        this.xapellidopropietario = response.data.xapellidopropietario;
        this.xtipodocidentidadpropietario = response.data.xtipodocidentidadpropietario ;
        this.xdocidentidadpropietario = response.data.xdocidentidadpropietario ;
        this.xdireccionpropietario = response.data.xdireccionpropietario ;
        this.xtelefonocelularpropietario = response.data.xtelefonocelularpropietario;
        this.xestadopropietario = response.data.xestadopropietario;
        this.xciudadpropietario = response.data.xciudadpropietario;
        this.xocupacionpropietario = response.data.xocupacionpropietario;
        this.xestadocivilpropietario = response.data.xestadocivilpropietario;
        this.xemailpropietario = response.data.xemailpropietario;
        this.xtelefonopropietario = response.data.xtelefonopropietario;
        this.cvehiculopropietario = response.data.cvehiculopropietario;
        this.ctipoplan = response.data.ctipoplan;
        this.cplan = response.data.cplan;
        this.cmetodologiapago = response.data.cmetodologiapago;
        this.ctiporecibo = response.data.ctiporecibo;
        this.xmarca = response.data.xmarca;
        this.xmoneda = response.data.xmoneda;
        this.xmodelo = response.data.xmodelo;
        this.xversion = response.data.xversion;
        this.xplaca = response.data.xplaca;
        this.xuso = response.data.xuso;
        this.xtipovehiculo = response.data.xtipovehiculo;
        this.nkilometraje = response.data.nkilometraje;
        this.xclase = response.data.xclase;
        this.xtransmision = response.data.xtransmision;
        this.fano = response.data.fano;
        this.xserialcarroceria = response.data.xserialcarroceria;
        this.xserialmotor = response.data.xserialmotor;
        this.xcolor = response.data.xcolor;
        this.mpreciovehiculo = response.data.mpreciovehiculo;
        this.ctipovehiculo = response.data.ctipovehiculo;
        this.xtipomodelovehiculo = response.data.xtipomodelovehiculo;
        this.ncapacidadcargavehiculo = response.data.ncapacidadcargavehiculo;
        this.ncapacidadpasajerosvehiculo = response.data.ncapacidadpasajerosvehiculo;
        this.ncapacidadpasajeros = response.data.ncapacidadpasajeros;
        this.xplancoberturas = response.data.xplancoberturas;
        this.xplanservicios = response.data.xplan;
        this.mprimatotal = response.data.mprimatotal;
        this.mprimaprorratatotal = response.data.mprimaprorratatotal;
        this.xzona_postal_propietario = response.data.xzona_postal_propietario;
        this.estatus = response.data.xestadocontrato;
        this.mmonto_plan = response.data.mtotal_plan
        this.femision = response.data.femision;
        this.xdocidentidadcorredor = response.data.xdocidentidadcorredor;
        this.xtelefonocorredor = response.data.xtelefonocorredor;
        let fechaInicio = this.femision;
        this.fdesde = response.data.femision;
        const fecha = new Date(fechaInicio); // Convertimos la cadena a objeto Date
        fecha.setFullYear(fecha.getFullYear() + 1); // Sumamos 1 al año
        this.fhasta = fecha.toISOString().slice(0, 10); // Convertimos la fecha resultante a cadena en formato ISO y extraemos solo la parte de la fecha
        if(response.data.xtomador){
          this.xtomador = response.data.xtomador;
        }else{
          this.xtomador = this.xnombrecliente;
        }
        
        if(response.data.xprofesion){
          this.xprofesion = response.data.xprofesion;
        }else{
          this.xprofesion = ' ';
        }

        if(response.data.xrif){
          this.xrif = response.data.xrif;
        }else{
          this.xrif = this.xdocidentidadcliente;
        }

        if(response.data.xdomicilio){
          this.xdomicilio = response.data.xdomicilio;
        }else{
          this.xdomicilio = this.xdireccionfiscalcliente;
        }

        if(response.data.xzona_postal){
          this.xzona_postal = response.data.xzona_postal;
        }else{
          this.xzona_postal = ' ';
        }

        if(response.data.xtelefono){
          this.xtelefono = response.data.xtelefono;
        }else{
          this.xtelefono = this.xtelefonocliente;
        }

        if(response.data.xcorreo){
          this.xcorreo = response.data.xcorreo;
        }else{
          this.xcorreo = this.xemailcliente;
        }

        if(response.data.xestado){
          this.xestado = response.data.xestado;
        }else{
          this.xestado = this.xestadocliente;
        }
        
        if(response.data.xciudad){
          this.xciudad = response.data.xciudad;
        }else{
          this.xciudad = this.xciudadcliente;
        }

        if (response.data.services) {
          for(let i = 0; i < response.data.services.length; i++) {
              this.serviceList.push({
                cservicio: response.data.services[i].cservicio,
                xservicio: response.data.services[i].xservicio,
                ctiposervicio: response.data.services[i].ctiposervicio,
                xtiposervicio: response.data.services[i].xtiposervicio,
              });
          }
        }

        if (response.data.servicesType) {
          for(let i = 0; i < response.data.servicesType.length; i++) {
              this.serviceTypeList.push({
                ctiposervicio: response.data.servicesType[i].ctiposervicio,
                xtiposervicio: response.data.servicesType[i].xtiposervicio,
              });
          }
        }

        this.createPDF();
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

  getCancellationPolicy(ccontratoflota){
    let cancellation = {};
    const modalRef = this.modalService.open(CauseForCancellationComponent);
    modalRef.componentInstance.cancellation = cancellation;
    modalRef.result.then((result: any) => { 

      if(result){
        this.cancellationData = {
          ccausaanulacion: result.ccausaanulacion,
        }
        this.onSubmit(ccontratoflota);
      }
    });
  }

  onSubmit(ccontratoflota){
    let params = {}
    if(ccontratoflota){
      params = {
        ccontratoflota: ccontratoflota,
        cancellationData: this.cancellationData
      }
      this.http.post(`${environment.apiUrl}/api/contract-arys/cancellation`, params).subscribe((response : any) => {
        if(response.data.status){
          this.alert.message = 'Se ha anulado el contrato seleccionado.';
          this.alert.type = 'success';
          this.alert.show = true;
    
          setTimeout(() => {
            this.alert.show = false;
          }, 3000);

          location.reload();
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

  buildServiceBody() {
    let uniqueTiposervicio = [...new Set(this.serviceList.map((service) => service.xtiposervicio))];
    let body = [];
  
    uniqueTiposervicio.forEach((tiposervicio, index) => {
      const servicios = this.serviceList.filter((service) => service.xtiposervicio === tiposervicio);
  
      servicios.forEach((service, serviceIndex) => {
        // Agregar fila para el tipo de servicio
        if (serviceIndex === 0) {
          body.push([{ text: tiposervicio, border: [true, false, true, false], bold: true, margin: [100, 0, 0, 0] }, { text: service.xservicio, border: [false, false, true, false] }]);
        } else {
          body.push([{ text: '', border: [true, false, true, false] }, { text: service.xservicio, border: [false, false, true, false], margin: [-1, 0, 0, 0] }]);
        }
      });
    });
  
    return body;
  }


  createPDF(){
    try{
    const pdfDefinition: any = {
      info: {
        title: `Certificado - ${this.xnombrepropietario} ${this.xapellidopropietario} N° ${this.ccontratoflota}`,
        subject: `Certificado - ${this.xnombrepropietario} ${this.xapellidopropietario} N° ${this.ccontratoflota}`
      },
      footer: function(currentPage, pageCount) { 
        return {
          table: {
            widths: ['*'],
            body: [
              [{text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center', border: [false, false, false, false]}]
            ]
          }
        }
      },
      content: [
        {
          style: 'data',
          table: {
            widths: [165, 216, 55, '*'],
            body: [
              [ {image: this.xlogo, width: 160, height: 50, border:[true, true, false, false]}, {text: `\n\nPANAUTO CLUB`, fontSize: 8.5, alignment: 'center', bold: true, border: [false, true, false, false]}, {text: '\nN° de Control\n\nEstatus', bold: true, border: [true, true, false, false]}, {text: `\n${this.ccontratoflota}\n\n${this.estatus}`, border:[false, true, true, false]}]
            ]
          }
        },
        {
          style: 'data', 
          table: {
            widths: [130, 80, 30, 55, 30, 55, '*'],
            body: [
              [{text: 'Datos del Contrato', alignment: 'center', fillColor: '#ababab', bold: true}, {text: 'Vigencia del Contrato:', bold: true, border: [false, true, false, false]}, {text: 'Desde:', bold: true, border: [false, true, false, false]}, {text: `${this.changeDateFormat(this.fdesde)}`, border: [false, true, false, false]}, {text: 'Hasta:', bold: true, border: [false, true, false, false]}, {text: `${this.changeDateFormat(this.fhasta)}`, border: [false, true, false, false]}, {text: 'Ambas a las 12 AM.', border: [false, true, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [70, 51, 80, 80, 80, '*'],
            body: [
              [{text: 'Fecha de Suscripción:', bold: true, border: [true, false, true, true]}, {text: this.changeDateFormat(this.femision), alignment: 'center', border: [false, false, true, true]}, {text: 'Sucursal Emisión:', bold: true, border: [false, false, false, true]}, {text: `Sucursal ${this.xsucursalemision}`, border: [false, false, false, true]}, {text: 'Sucursal Suscriptora:', bold: true, border: [false, false, false, true]}, {text: `Sucursal ${this.xsucursalsuscriptora}`, border: [false, false, true, true]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [130, 190, '*'],
            body: [
              [{text: 'Datos del Recibo', alignment: 'center', fillColor: '#ababab', bold: true, border: [true, false, true, true]}, {text: ' ', border: [false, false, true, false]}, {text: 'Datos del Plan', alignment: 'center', fillColor: '#ababab', bold: true, border: [false, false, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [70, 51, 50, 40, 82, 77, '*'],
            body: [
              [{text: 'Fecha de Emisión:', bold: true, border: [true, false, true, true]}, {text: this.changeDateFormat(this.femision), alignment: 'center', border: [false, false, true, true]}, {text: 'Moneda:', bold: true, border: [false, false, false, true]}, {text: this.xmoneda, border: [false, false, false, true]}, {text: ' ', border: [false, false, false, true]}, {text: this.xplanservicios, border: [true, false, true, true]}, {text: this.mmonto_plan, border: [false, false, true, true]} ]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [44, 296, '*', '*'],
            body: [
              [{text: 'ASEGURADO:', bold: true, border: [true, false, false, false]}, {text: `${this.xnombrepropietario} ${this.xapellidopropietario}`, border: [false, false, false, false]}, {text: 'C.I. / R.I.F.:', bold: true, border: [false, false, false, false]}, {text: this.xdocidentidadpropietario, border: [false, false, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [40, 310, '*'],
            body: [
              [{text: 'DOMICILIO:', bold: true, border: [true, false, false, false]}, {text: this.xdireccionpropietario, border: [false, false, false, false]}, {text: '', border: [false, false, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [35, 90, 30, 50, 30, 50, 24, '*'],
            body: [
              [{text: 'Provincia:', bold: true, border: [true, false, false, false]}, {text: this.xestadopropietario, border: [false, false, false, false]}, {text: 'Distrito:', bold: true, border: [false, false, false, false]}, {text: this.xciudadpropietario, border: [false, false, false, false]}, {text: 'Teléfono:', bold: true, border: [false, false, false, false]}, {text: this.xtelefonocelularpropietario, border: [false, false, false, false]}, {text: 'E-mail:', bold: true, border: [false, false, false, false]}, {text: this.xemailpropietario, border: [false, false, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: ['*'],
            body: [
              [{text: 'DATOS DEL AGENTE AUTORIZADO', alignment: 'center', fillColor: '#ababab', bold: true}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [100, '*'],
            body: [
              [{text: 'Agente Autorizado:', bold: true, border: [true, false, false, false]}, {text: this.xnombrecorredor, border: [false, false, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: ['*'],
            body: [
              [{text: 'DATOS DEL VEHÍCULO', alignment: 'center', fillColor: '#ababab', bold: true}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [30, 100, 30, 100, 35, '*'],
            body: [
              [{text: 'MARCA:', bold: true, border: [true, false, false, true]}, {text: this.xmarca, border: [false, false, false, true]}, {text: 'MODELO:', bold: true, border: [false, false, false, true]}, {text: this.xmodelo, border: [false, false, false, true]}, {text: 'VERSIÓN:', bold: true, border: [false, false, false, true]}, {text: this.xversion, border: [false, false, true, true]} ]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [20, 45, 80, 75, 70, 70, 20, '*'],
            body: [
              [{text: 'Año:', bold: true, border: [true, false, false, true]}, {text: this.fano, border: [false, false, false, true]}, {text: 'SERIAL CARROCERIA:', bold: true, border: [false, false, false, true]}, {text: this.xserialcarroceria, border: [false, false, false, true]}, {text: 'SERIAL DEL MOTOR:', bold: true, border: [false, false, false, true]}, {text: this.xserialmotor, border: [false, false, false, true]}, {text: 'Color:', bold: true, border: [false, false, false, true]}, {text: this.xcolor, border: [false, false, true, true]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: [55, 60, 30, 105, 35, 60, 50, '*'],
            body: [
              [{text: 'N° DE PUESTOS:', bold: true, border: [true, false, false, false]}, {text: this.ncapacidadpasajeros, border: [false, false, false, false]}, {text: 'TIPO:', bold: true, border: [false, false, false, false]}, {text: this.xtipovehiculo, border: [false, false, false, false]}, {text: 'PLACA:', bold: true, border: [false, false, false, false]}, {text: this.xplaca, border: [false, false, false, false]}, {text: 'KILOMETRAJE:', bold: true, border: [false, false, false, false]}, {text: this.nkilometraje, border: [false, false, true, false]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: ['*'],
            body: [
              [{text: 'DESCRIPCIÓN DE LOS SERVICIOS', alignment: 'center', fillColor: '#ababab', bold: true}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: ['*', '*'],
            body: [
              [{text: 'TIPOS DE SERVICIOS', alignment: 'center', fillColor: '#ababab', bold: true, border: [true, false, true, true]}, {text: 'SERVICIOS', alignment: 'center', fillColor: '#ababab', bold: true, border: [true, false, true, true]}]
            ]
          }
        },
        {
          style: 'data',
          table: {
            widths: ['*', '*'],
            body: this.buildServiceBody()
          }
        },
        {
          style: 'data',
          table: {
            widths: [230, 100, 60, '*'],
            body: [
              [{text: 'Costo Total de Plan', colSpan: 3, alignment: 'right', fillColor: '#ababab', bold: true, border: [true, true, true, true]}, {}, {}, {text: `USD ${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.mmonto_plan)}`, alignment: 'right', bold: true, fillColor: '#ababab', border: [false, true, true, true]}],
            ]
          }
        }
      ], 
      styles: {
        title: {
          fontSize: 9.5,
          bold: true,
          alignment: 'center'
        },
        header: {
          fontSize: 7.5,
          color: 'gray'
        },
        data: {
          fontSize: 7
        }
      }
    }
    let pdf = pdfMake.createPdf(pdfDefinition);
    pdf.download(`Póliza - ${this.xnombrecliente}`);
    pdf.open();
    this.search_form.disable()
    
    location.reload();
  }
    catch(err){console.log(err.message)}
  }
}
