import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators,FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '@services/authentication.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  closeResult: string;
  DataUser : FormGroup
  DataUserDocuments : FormGroup
  submitted = false;
  message : any;
  currentUser;
  DataClient : any = [];
  DataVehicle : any = [];


  constructor(
    private formBuilder: FormBuilder,
    private authenticationService : AuthenticationService,
    private http : HttpClient,
    private router : Router,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.DataUser = this.formBuilder.group({
      xnombre:  [''],
      xapellido:  [''],
      xzona_postal:  [''],
      icedula:  [''],
      xdocidentidad :  [''],
      xemail :  [''],
      xmarca:  [''],
      xmodelo:  [''],
      xversion:  [''],
      xplaca:  [''],
      fano :  [''],
      xcolor :  [''],
      xserialcarroceria :  [''],
      xseriamotor :  [''],
    });

    this.DataUserDocuments = this.formBuilder.group({
      cpropietario:  [''],
      xruta:  [''],
      itipodocumento:  [''],
      fvencimiento:  [''],
      fcreacion :  [''],
      fmodificacion :  [''],
      cusuariocreacion:  [''],
      cusuariomodificacion:  [''],

    });
    this.currentUser = this.authenticationService.currentUserValue;
    let params = {
      cpais: this.currentUser.data.cpais,
      cpropietario: this.currentUser.data.cpropietario
    } 
    this.http.post(environment.apiUrl + '/api/club/Data/Client/vehicle', params).subscribe((response : any) => {
        this.DataVehicle = response.data.listdatavehicle;

  },
  (error) => {
    console.log(error);
  });

    this.currentUser = this.authenticationService.currentUserValue;
    let data = {
      cpais: this.currentUser.data.cpais,
      cpropietario: this.currentUser.data.cpropietario
    } 
    this.http.post(environment.apiUrl + '/api/club/Data/Client', data).subscribe((response : any) => {
      this.DataClient = response.data.UserProfile
  });

  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}



