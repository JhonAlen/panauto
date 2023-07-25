import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenovationIndividualComponent } from './renovation-individual.component';

describe('RenovationIndividualComponent', () => {
  let component: RenovationIndividualComponent;
  let fixture: ComponentFixture<RenovationIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenovationIndividualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenovationIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
