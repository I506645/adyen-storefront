import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withFetch, withInterceptorsFromDi } from "@angular/common/http";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { AppRoutingModule } from "@spartacus/storefront";
import { AppComponent } from './app.component';
import { SpartacusModule } from './spartacus/spartacus.module';
import { AdyenPSPComponent } from './components/adyen-psp/adyen-psp.component';
import { provideConfig, CmsConfig } from "@spartacus/core";
import { CardComponent } from './components/card/card.component';
import { CheckoutPaymentFormComponent } from './components/checkout-payment-form/checkout-payment-form.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    CheckoutPaymentFormComponent
    //AdyenPSPComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}),
    AppRoutingModule,
    EffectsModule.forRoot([]),
    SpartacusModule
  ],
  providers: [provideHttpClient(withFetch(), withInterceptorsFromDi()), provideConfig(<CmsConfig>{
    cmsComponents: {
      CheckoutPaymentDetails: {
        component: AdyenPSPComponent,
      },
    },
  }),],
  bootstrap: [AppComponent]
})
export class AppModule { }
