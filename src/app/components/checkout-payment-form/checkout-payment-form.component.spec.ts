import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPaymentFormComponent } from './checkout-payment-form.component';

describe('CheckoutPaymentFormComponent', () => {
  let component: CheckoutPaymentFormComponent;
  let fixture: ComponentFixture<CheckoutPaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutPaymentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckoutPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
