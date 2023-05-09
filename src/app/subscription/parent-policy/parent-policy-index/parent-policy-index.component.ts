import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { WebServiceConnectionService } from '@services/web-service-connection.service';
import { AuthenticationService } from '@services/authentication.service';
import { environment } from '@environments/environment';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-parent-policy-index',
  templateUrl: './parent-policy-index.component.html',
  styleUrls: ['./parent-policy-index.component.css']
})
export class ParentPolicyIndexComponent implements OnInit {

  currentUser;
  loading: boolean = false;
  submitted: boolean = false;
  saveStatus: boolean = false;
  createBatch: boolean = false;
  showSaveButton: boolean = false;
  showEditButton: boolean = false;
  activateSave: boolean = false;
  alert = { show: false, type: "", message: "" };
  fleetContractList: any[] = [];
  parsedData: any[] = [];
  batchList: any[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService,
    private webService: WebServiceConnectionService) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = this.authenticationService.currentUserValue;
    if (this.currentUser) {
      let params = {
        cusuario: this.currentUser.data.cusuario,
        cmodulo: 109
      }
      let request = await this.webService.securityVerifyModulePermission(params);
      if (request.error) {
        request.condition && request.conditionMessage == 'user-dont-have-permissions' ? this.router.navigate([`/permission-error`]) : false;
        this.alert.message = request.message;
        this.alert.type = 'danger';
        this.alert.show = true;
        return;
      }
      if (request.data.status) {
        if (!request.data.bindice) {
          this.router.navigate([`/permission-error`]);
        }
      }
    }
  }

  onSubmit() {
    let batch = this.batchList.filter(batch => !batch.clote);
    this.submitted = true;
    this.loading = true;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      cusuario: this.currentUser.data.cusuario,
      parsedData: this.parsedData
    }
    this.http.post(`${environment.apiUrl}/api/fleet-contract-management/charge-contracts`, params, options).subscribe((response : any) => {
      if (response.data.status) {
        this.showSaveButton = false;
        this.saveStatus = false;
        this.showEditButton = true;
        alert(response.data.message);
        this.loading = false;
        this.activateSave = false;
      }
    },
    (err) => {
      let message = err.error.data.message;
      this.showSaveButton = false;
      this.saveStatus = false;
      this.showEditButton = true;
      alert(message);
      this.loading = false;
    });
  }
  
  parseCSV(file) {

    const requiredHeaders: any[] = [
      "XPOLIZA", "XNOMBRE", "XAPELLIDO", "ICEDULA", "XCEDULA", "FNAC", "CPLAN", "CPLAN_RC", "XSERIALCARROCERIA",
      "XSERIALMOTOR", "XPLACA", "XMARCA", "XMODELO", "XVERSION", "CANO", "XCOLOR", "XDIRECCIONFISCAL", "XTELEFONO_EMP",
      "XTELEFONO_PROP", "EMAIL", "FDESDE_POL", "FHASTA_POL", "FEMISION", "XPROVINCIA", "XDISTRITO", "XCORREGIMIENTO",
      "MPRIMA", "XCANAL_VENTA"
    ]

    return new Promise <any[]>((resolve, reject) => {
      let papa = new Papa();
      papa.parse(file, {
        delimiter: ";",
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          let error = "";
          let csvHeaders = Object.keys(results.data[0]);
          let lastRow = results.data[results.data.length - 1];
          let isEmpty = true;
          for (let key in lastRow) {
            if (lastRow[key]) {
              isEmpty = false;
              break;
            }
          }
          if (isEmpty) {
            results.data.pop();
          }
          if (JSON.stringify(csvHeaders) !== JSON.stringify(requiredHeaders)) {
            let missingAttributes = []
            missingAttributes  = requiredHeaders.filter(requiredHeader => !csvHeaders.some(csvHeader => csvHeader === requiredHeader));
            if (missingAttributes.length > 0) {
              error = `Error: El archivo suministrado no incluye todos los atributos necesarios. Se necesita incluir la/s columna/s: ${missingAttributes}`;
            }
            else {
              let additionalAttributes = [];
              additionalAttributes = csvHeaders.filter(csvHeader => !requiredHeaders.some(requiredHeader => requiredHeader === csvHeader));
              error = `Error: El archivo suministrado incluye atributos adicionales, elimine la/s siguiente/s columna/s: ${additionalAttributes}`;
            }
          }
          if (error) {
            results.data = [];
            alert(error);
          }
          resolve(results.data);
        }
      });
    });
  }

  async onFileSelect(event){
    //La lista fixedData representa los campos de los contratos que serán cargados solo en la tabla html fleetContractList
    //parsedData son todos los campos de cada contrato del CSV, los cuales serán insertados en la BD
    this.activateSave = false;
    let fixedData: any[] = [];
    let file = event.target.files[0];
    this.fleetContractList = [];
    this.parsedData = [];
    let parsedCSV = await this.parseCSV(file);
    if (parsedCSV.length > 0) {
      this.parsedData = parsedCSV;
      for (let i = 0; i < (this.parsedData.length); i++){
        fixedData.push({
          ncedula: this.parsedData[i].XCEDULA,
          xmarca: this.parsedData[i].XMARCA,
          xmodelo: this.parsedData[i].XMODELO,
          xplaca: this.parsedData[i].XPLACA,
          xversion: this.parsedData[i].XVERSION,
          xcliente: this.parsedData[i].XNOMBRE + ' ' + this.parsedData[i].XAPELLIDO
        })
      }
      this.fleetContractList = fixedData;
      this.activateSave = true;
    }
    else {
      event.target.value = null;
    }
  }
}