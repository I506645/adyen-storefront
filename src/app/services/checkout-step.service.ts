import { Inject, Injectable } from '@angular/core';
import { OccEndpointsService } from '@spartacus/core';
import { AdditionalDetailsData, ResultCode } from '@adyen/adyen-web';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DEFAULT_SHOPPER_REFERENCE } from '../utils/constants';
import paymentsConfig from '../utils/paymentsConfig';

type PaymentsResponse = {
    resultCode: ResultCode;
    action?: any;
    order?: any;
    donationToken?: string;
};

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8'
    })
};

@Injectable({
    providedIn: 'root'
})
export class CheckoutStepService {
    constructor(
        protected http: HttpClient,
        protected occ: OccEndpointsService,
    ) {}

    getPaymentMethods() {
        return this.http.get(this.occ.buildUrl('payments'));
    };

    fetchPaymentMethods(countryCode: string, shopperLocale: string, amount: { value: number; currency: string }) {
        const payload = {
            countryCode,
            shopperLocale,
            amount,
            channel: 'Web',
            shopperName: {
                firstName: 'Jonny',
                lastName: 'Jansen',
                gender: 'MALE'
            },
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            telephoneNumber: '0612345678',
            shopperEmail: 'test@adyen.com',
            dateOfBirth: '1970-07-10'
        };

        return this.http.post('/api/paymentMethods', payload, httpOptions);
    }

    makePaymentsCall(data: any, countryCode: string, shopperLocale: string, amount: { currency: string; value: number }) {
        const payload = {
            ...paymentsConfig,
            ...data,
            countryCode,
            shopperLocale,
            amount,
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            channel: 'Web'
        };

        return this.http.post<PaymentsResponse>('/api/payments', payload, httpOptions);
    }

    makeDetailsCall(data: AdditionalDetailsData['data']) {
        return this.http.post<PaymentsResponse>('/api/paymentDetails', data, httpOptions);
    }
}


/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// import { Injectable } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import {
//   CheckoutConfig,
//   CheckoutStep,
//   CheckoutStepType,
// } from '@spartacus/checkout/base/root';
// import { RoutingConfigService, RoutingService } from '@spartacus/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root',
// })
// export class CheckoutStepService {
//   // initial enabled steps
//   allSteps: CheckoutStep[] = [];

//   readonly steps$: BehaviorSubject<CheckoutStep[]> = new BehaviorSubject<
//     CheckoutStep[]
//   >([]);

//   readonly activeStepIndex$: Observable<number> = this.routingService
//     .getRouterState()
//     .pipe(
//       switchMap((router) => {
//         const activeStepUrl = router.state.context.id;
//         return this.steps$.pipe(
//           map((steps) => {
//             let activeIndex: number = 0;
//             steps.forEach((step, index) => {
//               const routeUrl = `/${
//                 this.routingConfigService.getRouteConfig(step.routeName)
//                   ?.paths?.[0]
//               }`;
//               if (routeUrl === activeStepUrl) {
//                 activeIndex = index;
//               }
//             });
//             return activeIndex;
//           })
//         );
//       })
//     );

//   constructor(
//     protected routingService: RoutingService,
//     protected checkoutConfig: CheckoutConfig,
//     protected routingConfigService: RoutingConfigService
//   ) {
//     this.resetSteps();
//   }

//   back(activatedRoute: ActivatedRoute): void {
//     const previousUrl = this.getPreviousCheckoutStepUrl(activatedRoute);
//     this.routingService.go(previousUrl === null ? 'cart' : previousUrl);
//   }

//   next(activatedRoute: ActivatedRoute): void {
//     const nextUrl = this.getNextCheckoutStepUrl(activatedRoute);
//     this.routingService.go(nextUrl);
//   }

//   goToStepWithIndex(stepIndex: number): void {
//     this.routingService.go(
//       this.getStepUrlFromStepRoute(this.allSteps[stepIndex].routeName)
//     );
//   }

//   getBackBntText(activatedRoute: ActivatedRoute): string {
//     if (this.getPreviousCheckoutStepUrl(activatedRoute) === null) {
//       return 'checkout.backToCart';
//     }
//     return 'common.back';
//   }

//   resetSteps(): void {
//     this.allSteps = (this.checkoutConfig.checkout?.steps ?? [])
//       .filter((step) => !step.disabled)
//       .map((checkoutStep) => Object.assign({}, checkoutStep));
//     this.steps$.next(this.allSteps);
//   }

//   disableEnableStep(
//     currentStepType: CheckoutStepType | string,
//     disabled: boolean
//   ): void {
//     const currentStep = this.allSteps.find((step) =>
//       step.type.includes(currentStepType as CheckoutStepType)
//     );
//     if (currentStep && currentStep.disabled !== disabled) {
//       currentStep.disabled = disabled;
//       this.steps$.next(this.allSteps.filter((step) => !step.disabled));
//     }
//   }

//   getCheckoutStep(currentStepType: CheckoutStepType): CheckoutStep | undefined {
//     const index = this.getCheckoutStepIndex('type', currentStepType);
//     if (index !== null) {
//       return this.allSteps[index];
//     }
//   }

//   getCheckoutStepRoute(currentStepType: CheckoutStepType): string | undefined {
//     return this.getCheckoutStep(currentStepType)?.routeName;
//   }

//   getFirstCheckoutStepRoute(): string {
//     return this.allSteps[0].routeName;
//   }

//   getNextCheckoutStepUrl(activatedRoute: ActivatedRoute): string | null {
//     const stepIndex = this.getCurrentStepIndex(activatedRoute);

//     if (stepIndex !== null && stepIndex >= 0) {
//       let i = 1;
//       while (
//         this.allSteps[stepIndex + i] &&
//         this.allSteps[stepIndex + i].disabled
//       ) {
//         i++;
//       }
//       const nextStep = this.allSteps[stepIndex + i];
//       if (nextStep) {
//         return this.getStepUrlFromStepRoute(nextStep.routeName);
//       }
//     }
//     return null;
//   }

//   getPreviousCheckoutStepUrl(activatedRoute: ActivatedRoute): string | null {
//     const stepIndex = this.getCurrentStepIndex(activatedRoute);

//     if (stepIndex !== null && stepIndex >= 0) {
//       let i = 1;
//       while (
//         this.allSteps[stepIndex - i] &&
//         this.allSteps[stepIndex - i].disabled
//       ) {
//         i++;
//       }
//       const previousStep = this.allSteps[stepIndex - i];
//       if (previousStep) {
//         return this.getStepUrlFromStepRoute(previousStep.routeName);
//       }
//     }
//     return null;
//   }

//   getCurrentStepIndex(activatedRoute: ActivatedRoute): number | null {
//     const currentStepUrl = this.getStepUrlFromActivatedRoute(activatedRoute);

//     const stepIndex = this.allSteps.findIndex(
//       (step) =>
//         currentStepUrl === `/${this.getStepUrlFromStepRoute(step.routeName)}`
//     );
//     return stepIndex === -1 ? null : stepIndex;
//   }

//   private getStepUrlFromActivatedRoute(
//     activatedRoute: ActivatedRoute
//   ): string | null {
//     return activatedRoute &&
//       activatedRoute.snapshot &&
//       activatedRoute.snapshot.url
//       ? `/${activatedRoute.snapshot.url.join('/')}`
//       : null;
//   }

//   private getStepUrlFromStepRoute(stepRoute: string): string | null {
//     return (
//       this.routingConfigService.getRouteConfig(stepRoute)?.paths?.[0] ?? null
//     );
//   }

//   private getCheckoutStepIndex(key: string, value: any): number | null {
//     return key && value
//       ? this.allSteps.findIndex((step: CheckoutStep) => {
//           const propertyVal = step[key as keyof CheckoutStep];
//           return propertyVal instanceof Array
//             ? propertyVal.includes(value)
//             : propertyVal === value;
//         })
//       : null;
//   }
// }
