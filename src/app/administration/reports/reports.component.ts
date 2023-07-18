import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@app/_services/authentication.service';
import { environment } from '@environments/environment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import { ColDef } from 'ag-grid-community';
import { headerLogoPDF } from './images.const';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  currentUser;
  search_form: UntypedFormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  alert = { show: false, type: "", message: "" };
  primaList: any[] = [];
  receiptList: any[] = [];
  searchStatus: boolean = false;
  generarReporte: boolean = false;
  mtotal;
  mtotalUSD;
  mtotalB;
  xtitulo: String = "";
  today;
  fdesde;
  fhasta;

  columnDefs: ColDef[] = [
    { headerName: 'Contrato N°', field: 'xpoliza', width: 110, resizable: true },
    { headerName: 'Certificado N°', field: 'ccontratoflota', width: 120, resizable: true },
    { headerName: 'Nombre Asegurado', field: 'xnombrepropietario', width: 170, resizable: true },
    { headerName: 'Sucursal', field: 'xsucursalemision', width: 130, resizable: true },
    { headerName: 'Cód. Inter.', field: 'ccorredor', width: 105, resizable: true },
    { headerName: 'Nombre Intermediario', field: 'xcorredor', width: 170, resizable: true },
    { headerName: 'Recibo N°', field: 'nrecibo', width: 140, resizable: true },
    { headerName: 'Monto Prima', field: 'mprima', width: 140, resizable: true },
    { headerName: 'Moneda', field: 'xmoneda', width: 100, resizable: true },
    { headerName: 'Fec. Emisión', field: 'femision', width: 140, resizable: true },
    { headerName: 'Días', field: 'ndias', width: 80, resizable: true }
  ];

  constructor(private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private router: Router,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.search_form = this.formBuilder.group({
      fdesde: [''],
      fhasta: [''],
      xprima: [''],
      xtitulo: ['']
    });
    this.currentUser = this.authenticationService.currentUserValue;
    if (this.currentUser) {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let options = { headers: headers };
      let params = {
        cusuario: this.currentUser.data.cusuario,
        cmodulo: 122
      }
      this.http.post(`${environment.apiUrl}/api/security/verify-module-permission`, params, options).subscribe((response: any) => {
        if (response.data.status) {
          if (!response.data.bindice) {
            this.router.navigate([`/permission-error`]);
          } else {

          }
        }
      },
        (err) => {
          let code = err.error.data.code;
          let message;
          if (code == 400) { message = "HTTP.ERROR.PARAMSERROR"; }
          else if (code == 401) {
            let condition = err.error.data.condition;
            if (condition == 'user-dont-have-permissions') { this.router.navigate([`/permission-error`]); }
          } else if (code == 500) { message = "HTTP.ERROR.INTERNALSERVERERROR"; }
          this.alert.message = message;
          this.alert.type = 'danger';
          this.alert.show = true;
        });
    }
  }

  getTitulo() {
    if (this.search_form.get('xprima').value == 'PENDIENTES') {
      this.search_form.get('xtitulo').setValue('Pendientes');
      this.search_form.get('xtitulo').disable();
      this.xtitulo = "Pendientes"
    } else {
      this.search_form.get('xtitulo').setValue('Cobrados');
      this.search_form.get('xtitulo').disable();
      this.xtitulo = "Cobrados"
    }
    this.onSearch(this.search_form.value)
  }

  onSearch(form) {
    this.loading = true;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let params = {
      fdesde: form.fdesde,
      fhasta: form.fhasta,
      xprima: form.xprima
    };
    this.http.post(`${environment.apiUrl}/api/administration/search-poliza`, params, options).subscribe((response: any) => {
      if (response.data.status) {
        this.receiptList = [];
        for (let i = 0; i < response.data.receipts.length; i++) {
          this.receiptList.push({
            xpoliza: response.data.receipts[i].xpoliza,
            ccontratoflota: response.data.receipts[i].ccontratoflota,
            xnombrepropietario: response.data.receipts[i].xnombre,
            xsucursalemision: response.data.receipts[i].xsucursalemision,
            ccorredor: response.data.receipts[i].ccorredor,
            xcorredor: response.data.receipts[i].xcorredor,
            nrecibo: response.data.receipts[i].nrecibo,
            mprima: response.data.receipts[i].mprima,
            xmoneda: response.data.receipts[i].xmoneda,
            femision: response.data.receipts[i].femision,
            ndias: 15
            /*fdesde_rec: response.data.receipts[i].fdesde_rec,
            fhasta_rec: response.data.receipts[i].fhasta_rec*/
          })
          if (response.data.receipts[i].xmoneda == "USD") {
            this.mtotalUSD = response.data.receipts.reduce((acc, curr) => acc + curr.mprima, 0);
          } else {
            this.mtotalB = response.data.receipts.reduce((acc, curr) => acc + curr.mprima, 0);
          }
          let monto = 0
          // this.mtotal = response.data.receipts.reduce((acc, curr) => acc + curr.mprima, 0);
        }
        if (this.receiptList) {
          this.generarReporte = true;
        } else {
          this.generarReporte = false;
        }

        let dateFormat = new Date();

        this.fdesde = form.fdesde;
        this.fhasta = form.fhasta;
        this.today = dateFormat.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      this.loading = false;
    },
      (err) => {
        let code = err.error.data.code;
        let message: string;
        if (code == 400) { message = "HTTP.ERROR.PARAMSERROR"; }
        else if (code == 401) {
          let condition = err.error.data.condition;
          if (condition == 'user-dont-have-permissions') { this.router.navigate([`/permission-error`]); }
        } else if (code == 500) { message = "HTTP.ERROR.INTERNALSERVERERROR"; }
        this.loading = false;
      });
  }


  getMonthAsString(month) {
    month = month + 1;
    if (month == 1) {
      return 'Enero'
    }
    if (month == 2) {
      return 'Febrero'
    }
    if (month == 3) {
      return 'Marzo'
    }
    if (month == 4) {
      return 'Abril'
    }
    if (month == 5) {
      return 'Mayo'
    }
    if (month == 6) {
      return 'Junio'
    }
    if (month == 7) {
      return 'Julio'
    }
    if (month == 8) {
      return 'Agosto'
    }
    if (month == 9) {
      return 'Septiembre'
    }
    if (month == 10) {
      return 'Octubre'
    }
    if (month == 11) {
      return 'Noviembre'
    }
    if (month == 12) {
      return 'Diciembre'
    }
  }

  changeDateFormat(date) {
    let dateArray = date.split("-");
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
  }

  buildReceiptBody(startIndex: number, endIndex: number) {
    let body = [];

    for (let i = startIndex; i < endIndex; i++) {
      const row = this.receiptList[i];

      let dataRow = [];
      dataRow.push({ text: row.xpoliza, border: [false, false, false, false] });
      dataRow.push({ text: row.xnombrepropietario, border: [false, false, false, false] });
      dataRow.push({ text: row.ccontratoflota, border: [false, false, false, false] });
      dataRow.push({
        text: `${new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(row.mprima)} ${row.xmoneda} `,
        border: [false, false, false, false],
      });
      body.push(dataRow);
    }

    return body;
  }

  createPDF() {
    this.mtotalB = this.mtotalB ? this.mtotalB : 0;
    this.mtotalUSD = this.mtotalUSD ? this.mtotalUSD : 0;
    const tipoPrimas = this.search_form.get('xprima').value;
  
    const itemsPerPage = 15; // Registros por página
    const totalPages = Math.ceil(this.receiptList.length / itemsPerPage); // Calcular el número total de páginas
  
    const pdfDefinition: any = {
      content: [],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          fillColor: '#b9d4ff',
          margin: [0, 5, 0, 5]
        },
        data: {
          fontSize: 10,
          margin: [0, 5, 0, 5]
        }
      },
      info: {
        title: `Reporte de Contratos ${this.xtitulo}`,
        subject: `Reporte de Contratos ${this.xtitulo}`
      },
      footer: function (currentPage, pageCount) {
        return {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'center',
          fontSize: 8,
          margin: [0, 10, 0, 10]
        };
      },
    };
  
    let totalContratos = 0; // Variable para almacenar el monto total de los contratos
  
    for (let currentPage = 0; currentPage < totalPages; currentPage++) {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, this.receiptList.length);
  
      let montoPrimaPorPagina = 0; // Variable para almacenar el monto total de Monto Prima en la página actual
  
      const pageContent = [
        {
          alignment: 'center',
          width: 300,
          image: headerLogoPDF,
        },
        {
          columns: [
            {
              text: [
                { text: ' ' },
              ],
            },
          ],
        },
        {
          columns: [
            {
              text: [
                { text: ' ' },
              ],
            },
          ],
        },
        {
          fontSize: 10,
          table: {
            widths: [130, 160, 100, '*'],
            body: [
              [{text: 'Fecha de Solicitud', alignment: 'center', fillColor: '#b9d4ff', bold: true, border: [true, true, true, true]}, {text: ' ', border: [false, false, false, false]}, {text: 'Rango Desde', alignment: 'center', fillColor: '#b9d4ff', bold: true, border: [true, true, true, true]}, {text: 'Rango Hasta', alignment: 'center', fillColor: '#b9d4ff', bold: true, border: [true, true, true, true]}]
            ]
          }
        },
        {
          table: {
            widths: [130, 160, 100, '*'],
            body: [
              [{text: this.today, alignment: 'center', bold: true, border: [true, false, true, true], lineColor: '#b9d4ff'}, {text: ' ', border: [false, false, false, false]}, {text: this.changeDateFormat(this.fdesde), alignment: 'center', bold: true, border: [true, false, true, true], lineColor: '#b9d4ff'}, {text: this.changeDateFormat(this.fhasta), alignment: 'center', bold: true, border: [true, false, true, true], lineColor: '#b9d4ff'}]
            ]
          }
        },
        {
          columns: [
            {
              margin: [0, 20, 0, 0],
              alignment: 'center',
              style: 'title',
              text: [
                { text: `\nCONTRATOS ${tipoPrimas} `, bold: true },
              ],
            },
          ],
        },
        {
          columns: [
            {
              text: [
                { text: ' ' },
              ],
            },
          ],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [{text: ' ', border: [false, true, false, false]}]
            ]
          }
        },
        {
          columns: [
            {
              text: [
                { text: ' ' },
              ],
            },
          ],
        },
        {
          table: {
            headerRows: 1,
            widths: [120, 115, 120, 110],
            dontBreakRows: true,
            body: [
              [{ text: 'Contrato', style: 'tableHeader', fillColor: '#b9d4ff' },
              { text: 'Nombre', style: 'tableHeader', fillColor: '#b9d4ff' },
              { text: 'N° de Contrato', style: 'tableHeader', fillColor: '#b9d4ff' },
              { text: 'Monto Contrato', style: 'tableHeader', fillColor: '#b9d4ff' },]
            ],
          },
          layout: 'headerLineOnly',
        },
        {
          style: 'data',
          table: {
            dontBreakRows: true,
            widths: [120, 150, 120, 120],
            heights: 20,
            body: this.buildReceiptBody(startIndex, endIndex),
          },
        },
      ];
  
      // Calcular el monto total de Monto Prima en la página actual
      for (let i = startIndex; i < endIndex; i++) {
        montoPrimaPorPagina += this.receiptList[i].mprima;
      }
  
      pdfDefinition.content.push(...pageContent);
  
      totalContratos += montoPrimaPorPagina; // Sumar el monto total de Monto Prima en la página actual al monto total de contratos
  
      if (currentPage !== totalPages - 1) {
        // Agregar un salto de página entre páginas, excepto en la última página
        pdfDefinition.content.push({ text: '', pageBreak: 'after' });
      }
    }

    pdfDefinition.content.push({
      table: {
        widths: ['*', 130], // Añadimos una columna adicional para el espacio en blanco
        body: [
          [
            { text: '', border: [false, false, false, false] }, // Columna vacía para el espacio en blanco
            {
              text: `Monto Total: | ${totalContratos.toFixed(2)}`,
              bold: true,
              fillColor: '#b9d4ff',
              border: [true, true, true, true],
              alignment: 'right'
            }
          ]
        ]
      },
      margin: [0, 10, 0, 0]
    });
  
    pdfMake.createPdf(pdfDefinition).open(); // Abrir el PDF
  }
  
  generateExcel(){
    // Crear un arreglo para almacenar los datos
    const data = [];

    // Iterar sobre la lista de recibos y agregar los datos al arreglo
    for (const receipt of this.receiptList) {
      data.push({
        'Poliza': receipt.xpoliza,
        'Contrato Flota': receipt.ccontratoflota,
        'Nombre Propietario': receipt.xnombrepropietario,
        'Sucursal Emisión': receipt.xsucursalemision,
        'Corredor': receipt.xcorredor,
        'N° de Recibo': receipt.nrecibo,
        'Monto Prima': receipt.mprima,
        'Moneda': receipt.xmoneda,
        'Fecha Emisión': receipt.femision,
        'Días': receipt.ndias
      });
    }

    // Crear una hoja de cálculo (worksheet)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Crear un libro de trabajo (workbook) y agregar la hoja de cálculo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    // Convertir el libro de trabajo a un búfer Excel
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un objeto Blob con el búfer Excel
    const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Guardar el archivo Excel usando FileSaver.js
    saveAs(excelData, `Reporte de Contratos ${this.xtitulo} solicitados el día ${this.today}.xlsx`);
  }
}
