import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators , FormBuilder} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication.service';
import { environment } from '@environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RenovationIndividualComponent } from '@app/pop-up/renovation-individual/renovation-individual.component';

@Component({
  selector: 'app-renovation-contract-individuals',
  templateUrl: './renovation-contract-individuals.component.html',
  styleUrls: ['./renovation-contract-individuals.component.css']
})
export class RenovationContractIndividualsComponent implements OnInit {

  currentUser;
  keyword = 'value';
  search_form : UntypedFormGroup;
  searchStatus: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  alert = { show: false, type: "", message: "" };
  canCreate: boolean = false;
  canDetail: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  months: string[] = [];
  years: number[] = [];
  contractList: any[] = [];
  renovationList = {};
  filteredData: any[] = [];
  public page = 1;
  public pageSize = 7;
  bactiva: boolean = false;
  ccarga;
  xplaca;


  constructor(private formBuilder: UntypedFormBuilder,
              private authenticationService : AuthenticationService,
              private http: HttpClient,
              private router: Router,
              private modalService : NgbModal) { }

  ngOnInit(): void {
    this.search_form = this.formBuilder.group({
      xmes:[''],
      xano:[''],
      fdesde: [''],
      fhasta: [''],
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
    this.generateMonthList();
    this.generateYearList();
  }

  generateMonthList() {
    this.months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;

    for (let year = startYear; year <= currentYear + 10; year++) {
      this.years.push(year);
    }
  }

  transformationDate(){
    const selectedMes = this.search_form.get('xmes').value;
    const selectedAno = this.search_form.get('xano').value;
  
    const monthIndex = this.months.findIndex(month => month === selectedMes);
    const startDate = new Date(selectedAno, monthIndex, 1);
    const endDate = new Date(selectedAno, monthIndex + 1, 0);
  
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
  
    this.search_form.get('fdesde').setValue(formattedStartDate)
    this.search_form.get('fhasta').setValue(formattedEndDate)

    if(this.search_form.get('fdesde').value, this.search_form.get('fhasta').value){
      this.searchContract();
    }
    
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  }

  searchContract(){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      fdesde: this.search_form.get('fdesde').value,
      fhasta: this.search_form.get('fhasta').value
    }
    this.http.post(`${environment.apiUrl}/api/renovations/search`, params, options).subscribe((response : any) => {
      if(response.data.list){
         this.contractList = [];
         for(let i = 0; i < response.data.list.length; i++){
          const fhastaPol = new Date(response.data.list[i].fhasta_pol);

          // Obtener el día, mes y año
          const day = fhastaPol.getDate();
          const month = fhastaPol.getMonth() + 1; // Sumar 1 porque los meses son indexados desde 0
          const year = fhastaPol.getFullYear();
        
          // Construir la fecha en el formato deseado
          const formattedFhastaPol = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;

            this.contractList.push({
              xnombre: response.data.list[i].xnombre,
              ccarga: response.data.list[i].ccarga,
              xvehiculo: response.data.list[i].xvehiculo,
              xplaca: response.data.list[i].xplaca,
              fano: response.data.list[i].fano,
              fhasta_pol: formattedFhastaPol,
            }) 
         }
         this.filteredData = this.contractList;
         if(this.filteredData[0]){
          this.bactiva = true
         }else{
          this.bactiva = false
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
      }else if(code == 500){ window.alert(`No se encontraron contratos con los parámetros seleccionados por el mes de ${this.search_form.get('xmes').value} del ${this.search_form.get('xano').value}`) }
      else if(code == 404){ window.alert(`No se encontraron contratos con los parámetros seleccionados por el mes de ${this.search_form.get('xmes').value} del ${this.search_form.get('xano').value}`) }
    });
  }

  filterData(value: string) {
    this.filteredData = this.contractList.filter((item) => {
      const searchValue = value.toLowerCase();
      const nombres = item.xnombre ? item.xnombre.toString().toLowerCase() : '';
      const vehiculo = item.xvehiculo ? item.xvehiculo.toString().toLowerCase() : '';
      const fano = item.fano ? item.fano.toString().toLowerCase() : '';
      const placa = item.xplaca ? item.xplaca.toString().toLowerCase() : '';
  
      return nombres.includes(searchValue) || vehiculo.includes(searchValue) || fano.includes(searchValue) || placa.includes(searchValue);
    });
  }

  renovation(placa, ccarga){
    let renovation;
    const modalRef = this.modalService.open(RenovationIndividualComponent);
    modalRef.componentInstance.renovation = renovation;
    modalRef.result.then((result: any) => { 
      if(result){
        this.renovationList = {
          cplan: result.cplan,
          cplan_rc: result.cplan_rc
        }
        this.xplaca = placa;
        this.ccarga = ccarga;

        if(this.renovationList){
          this.onSubmit();
        }
      }
    });
  }

  onSubmit(){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      planes: this.renovationList,
      xplaca: this.xplaca,
      ccarga: this.ccarga,
      cusuario: this.currentUser.data.cusuario
    }
    this.http.post(`${environment.apiUrl}/api/renovations/create`, params, options).subscribe((response : any) => {
      if(response.data.status){
        window.alert(`Se renovó el contrato N° ${this.ccarga}`)
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
      }else if(code == 500){ window.alert(`No se pudo renovar el contrato`) }
      else if(code == 404){ window.alert(`No se pudo renovar el contrato`) }
    });
  }

}
