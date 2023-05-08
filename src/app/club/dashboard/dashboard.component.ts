import { Component, ChangeDetectorRef , OnInit, ViewChild, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '@services/authentication.service';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import dayGridPlugin from '@fullcalendar/daygrid'; // fo
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, UntypedFormGroup, Validators,FormControl, FormGroup, AbstractControl } from '@angular/forms';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  @ViewChild("content") private contentRef: TemplateRef<Object>;
  @ViewChild("calendar") private content: TemplateRef<Object>;
  EventsCalendar : FormGroup

  closeResult: string;

  name : string
  apellido: string
  date : any
  message = false;
  datamessage : any

  code
  Events: any[] = [];
  calendarVisible = true;
  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };

  currentEvents: EventApi[] = [];

  currentUser;
  constructor(
    private authenticationService : AuthenticationService,
    private http : HttpClient,
    private changeDetector: ChangeDetectorRef,
    private modalService : NgbModal,
    private formBuilder: FormBuilder, ) { 
  }

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }
  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }
  handleDateSelect(selectInfo: DateSelectArg) {
    this.date = selectInfo.startStr
    this.open(this.content)
    const calendarApi = selectInfo.view.calendar;
    this.currentUser = this.authenticationService.currentUserValue;
    if(this.EventsCalendar.get('evento').value == null){
      this.message = false
      let params = {
        title: this.EventsCalendar.get('evento').value,
        start: selectInfo.startStr + this.EventsCalendar.get('hora').value,
        end: this.EventsCalendar.get('fhasta').value + this.EventsCalendar.get('hora').value,
        cpropietario: this.currentUser.data.cpropietario
      }
      this.http
      .post(environment.apiUrl + '/api/club/client-agenda' ,params)
      .subscribe((res: any) => {
        this.Events = []
        this.Events = res.data.list
        this.calendarOptions = {
          initialView: 'dayGridMonth',
          events: this.Events,
        };
      });
    }else{
      this.message = true
      this.datamessage = 'Es requerida la descripción del evento'
    }

  }
  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`¿Seguro de que deseas elminar '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  }
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges();
  }
  ngOnInit(){

    this.EventsCalendar = this.formBuilder.group({
      evento:  [''],
      hora:  [''],
      fdesde:  [''],
      fhasta:  [''],
    });

    this.currentUser = this.authenticationService.currentUserValue;
    let params = {
      cpropietario: this.currentUser.data.cpropietario
    }
    this.http
    .post(environment.apiUrl + '/api/club/search/client-agenda' ,params)
    .subscribe((res: any) => {
      this.Events = []
      this.Events = res.data.list 
      this.calendarOptions = {
        initialView: 'dayGridMonth',
        events: this.Events,
      };
      if(res.data.message){
        this.message = res.data.message
        this.name = res.data.name
        this.apellido = res.data.apellido
        this.open(this.contentRef);
      }
    });
    
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    },);
  }

}