import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenovationContractIndividualsComponent } from './renovation-contract-individuals.component';

describe('RenovationContractIndividualsComponent', () => {
  let component: RenovationContractIndividualsComponent;
  let fixture: ComponentFixture<RenovationContractIndividualsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenovationContractIndividualsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenovationContractIndividualsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
