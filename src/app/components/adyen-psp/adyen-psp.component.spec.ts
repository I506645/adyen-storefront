import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdyenPSPComponent } from './adyen-psp.component';

describe('AdyenPSPComponent', () => {
  let component: AdyenPSPComponent;
  let fixture: ComponentFixture<AdyenPSPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdyenPSPComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdyenPSPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
