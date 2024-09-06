import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AdyenCheckout,
  CoreConfiguration,
  Dropin,
  Card,
  AdyenCheckoutError,
  PaymentCompletedData,
  UIElement,
  PaymentFailedData,
  AdditionalDetailsData,
  AdditionalDetailsActions,
  SubmitActions,
  SubmitData,
  PayPal,
  GooglePay,
} from '@adyen/adyen-web';
import { environment } from '../../environments/environment';
import { parseAmount } from '../../utils/amount-utils';
import { DEFAULT_AMOUNT, DEFAULT_COUNTRY, DEFAULT_LOCALE } from '../../utils/constants';
import { CheckoutStepService } from '../../services/checkout-step.service';

@Component({
  selector: 'app-adyen-psp',
  templateUrl: './adyen-psp.component.html',
  styleUrls: ['./adyen-psp.component.scss'],
})
export class AdyenPSPComponent implements OnInit {
  //adyenPSPResponse: any = {};
  @ViewChild('hook', { static: true })
  hook: ElementRef;

  dropin: Dropin | undefined;

  constructor(
    private checkoutStepService: CheckoutStepService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.hook = new ElementRef('');
    this.dropin = undefined;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createCheckout();
    }
  }
  

  async createCheckout() {
    const urlParams = new URLSearchParams(window.location.search);

    const countryCode = urlParams.get('countryCode') || DEFAULT_COUNTRY;
    const locale = urlParams.get('shopperLocale') || DEFAULT_LOCALE;
    const amount = parseAmount(urlParams.get('amount') || DEFAULT_AMOUNT, countryCode);

    this.checkoutStepService.fetchPaymentMethods(countryCode, locale, amount).subscribe(async paymentMethodsResponse => {
        const options: CoreConfiguration = {
            amount,
            countryCode,
            locale,
            environment: 'test',
            clientKey: environment.clientKey,
            paymentMethodsResponse,

            onSubmit: async (state: SubmitData, component: UIElement, actions: SubmitActions) => {
                this.checkoutStepService.makePaymentsCall(state.data, countryCode, locale, amount).subscribe(result => {
                    if (!result.resultCode) {
                        actions.reject();
                        return;
                    }

                    const { resultCode, action, order, donationToken } = result;

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });
                });
            },

            onAdditionalDetails: async (state: AdditionalDetailsData, component: UIElement, actions: AdditionalDetailsActions) => {
                this.checkoutStepService.makeDetailsCall(state.data).subscribe(result => {
                    if (!result.resultCode) {
                        actions.reject();
                        return;
                    }

                    const { resultCode, action, order, donationToken } = result;

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });
                });
            },

            onError(error: AdyenCheckoutError) {
                console.error('Something went wrong', error);
            },

            onPaymentCompleted(data: PaymentCompletedData, element: UIElement) {
                console.log('onPaymentCompleted', data, element);
            },

            onPaymentFailed(data: PaymentFailedData, element: UIElement) {
                console.log('onPaymentCompleted', data, element);
            }
        };

        const checkout = await AdyenCheckout(options);
        this.dropin = new Dropin(checkout, {
            paymentMethodsConfiguration: {
                card: {
                    _disableClickToPay: true
                }
            },
            //@ts-ignore
            paymentMethodComponents: [Card, PayPal, GooglePay]
        }).mount(this.hook.nativeElement);
    });
}

  // constructor(
  //   protected checkoutStepService: CheckoutStepService,
  // ) { }

  // ngOnInit(): void {
  //   this.checkoutStepService.getPaymentMethods().subscribe((res: any) => {
  //     this.adyenPSPResponse = res;
  //   });
  // }
}

/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// import {
//   ChangeDetectionStrategy,
//   Component,
//   OnDestroy,
//   OnInit,
//   Optional,
//   inject,
// } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { ActiveCartFacade } from '@spartacus/cart/base/root';
// import {
//   CheckoutDeliveryAddressFacade,
//   CheckoutPaymentFacade,
// } from '@spartacus/checkout/base/root';
// import {
//   Address,
//   FeatureConfigService,
//   getLastValueSync,
//   GlobalMessageService,
//   GlobalMessageType,
//   PaymentDetails,
//   TranslationService,
//   UserPaymentService,
// } from '@spartacus/core';
// import { Card, ICON_TYPE } from '@spartacus/storefront';
// import {
//   BehaviorSubject,
//   combineLatest,
//   Observable,
//   of,
//   Subscription,
// } from 'rxjs';
// import {
//   distinctUntilChanged,
//   filter,
//   map,
//   switchMap,
//   take,
//   tap,
// } from 'rxjs/operators';
// import { CheckoutStepService } from '../../services/checkout-step.service';

// @Component({
//   selector: 'app-adyen-psp',
//   templateUrl: './adyen-psp.component.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class AdyenPSPComponent implements OnInit, OnDestroy {
//   protected subscriptions = new Subscription();
//   protected deliveryAddress: Address | undefined;
//   protected busy$ = new BehaviorSubject<boolean>(false);
//   @Optional() protected featureConfigService = inject(FeatureConfigService, {
//     optional: true,
//   });

//   cards$: Observable<{ content: Card; paymentMethod: PaymentDetails }[]>;
//   iconTypes = ICON_TYPE;
//   isGuestCheckout = false;
//   newPaymentFormManuallyOpened = false;
//   doneAutoSelect = false;
//   paymentDetails?: PaymentDetails;

//   isUpdating$: Observable<boolean> = combineLatest([
//     this.busy$,
//     this.userPaymentService.getPaymentMethodsLoading(),
//     this.checkoutPaymentFacade
//       .getPaymentDetailsState()
//       .pipe(map((state) => state.loading)),
//   ]).pipe(
//     map(
//       ([busy, userPaymentLoading, paymentMethodLoading]) =>
//         busy || userPaymentLoading || paymentMethodLoading
//     ),
//     distinctUntilChanged()
//   );

//   get backBtnText() {
//     return this.checkoutStepService.getBackBntText(this.activatedRoute);
//   }

//   get existingPaymentMethods$(): Observable<PaymentDetails[]> {
//     return this.userPaymentService.getPaymentMethods();
//   }

//   get selectedMethod$(): Observable<PaymentDetails | undefined> {
//     return this.checkoutPaymentFacade.getPaymentDetailsState().pipe(
//       filter((state) => !state.loading),
//       map((state) => state.data),
//       distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
//     );
//   }

//   constructor(
//     protected userPaymentService: UserPaymentService,
//     protected checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
//     protected checkoutPaymentFacade: CheckoutPaymentFacade,
//     protected activatedRoute: ActivatedRoute,
//     protected translationService: TranslationService,
//     protected activeCartFacade: ActiveCartFacade,
//     protected checkoutStepService: CheckoutStepService,
//     protected globalMessageService: GlobalMessageService
//   ) {}

//   ngOnInit(): void {
//     if (!getLastValueSync(this.activeCartFacade.isGuestCart())) {
//       this.userPaymentService.loadPaymentMethods();
//     } else {
//       this.isGuestCheckout = true;
//     }

//     this.checkoutDeliveryAddressFacade
//       .getDeliveryAddressState()
//       .pipe(
//         filter((state) => !state.loading),
//         take(1),
//         map((state) => state.data)
//       )
//       .subscribe((address) => {
//         this.deliveryAddress = address;
//       });

//     this.cards$ = combineLatest([
//       this.existingPaymentMethods$.pipe(
//         switchMap((methods) => {
//           return !methods?.length
//             ? of([])
//             : combineLatest(
//                 methods.map((method) =>
//                   combineLatest([
//                     of(method),
//                     this.translationService.translate('paymentCard.expires', {
//                       month: method.expiryMonth,
//                       year: method.expiryYear,
//                     }),
//                   ]).pipe(
//                     map(([payment, translation]) => ({
//                       payment,
//                       expiryTranslation: translation,
//                     }))
//                   )
//                 )
//               );
//         })
//       ),
//       this.selectedMethod$,
//       this.translationService.translate('paymentForm.useThisPayment'),
//       this.translationService.translate('paymentCard.defaultPaymentMethod'),
//       this.translationService.translate('paymentCard.selected'),
//     ]).pipe(
//       tap(([paymentMethods, selectedMethod]) =>
//         this.selectDefaultPaymentMethod(paymentMethods, selectedMethod)
//       ),
//       map(
//         ([
//           paymentMethods,
//           selectedMethod,
//           textUseThisPayment,
//           textDefaultPaymentMethod,
//           textSelected,
//         ]) =>
//           paymentMethods.map((payment) => ({
//             content: this.createCard(
//               payment.payment,
//               {
//                 textExpires: payment.expiryTranslation,
//                 textUseThisPayment,
//                 textDefaultPaymentMethod,
//                 textSelected,
//               },
//               selectedMethod
//             ),
//             paymentMethod: payment.payment,
//           }))
//       )
//     );
//   }

//   selectDefaultPaymentMethod(
//     paymentMethods: { payment: PaymentDetails; expiryTranslation: string }[],
//     selectedMethod: PaymentDetails | undefined
//   ) {
//     if (
//       !this.doneAutoSelect &&
//       paymentMethods?.length &&
//       (!selectedMethod || Object.keys(selectedMethod).length === 0)
//     ) {
//       const defaultPaymentMethod = paymentMethods.find(
//         (paymentMethod) => paymentMethod.payment.defaultPayment
//       );
//       if (defaultPaymentMethod) {
//         selectedMethod = defaultPaymentMethod.payment;
//         this.savePaymentMethod(selectedMethod);
//       }
//       this.doneAutoSelect = true;
//     }
//   }

//   selectPaymentMethod(paymentDetails: PaymentDetails): void {
//     if (paymentDetails?.id === getLastValueSync(this.selectedMethod$)?.id) {
//       return;
//     }

//     this.globalMessageService.add(
//       {
//         key: 'paymentMethods.paymentMethodSelected',
//       },
//       GlobalMessageType.MSG_TYPE_INFO
//     );

//     this.savePaymentMethod(paymentDetails);
//   }

//   showNewPaymentForm(): void {
//     this.newPaymentFormManuallyOpened = true;
//   }

//   hideNewPaymentForm(): void {
//     this.newPaymentFormManuallyOpened = false;
//   }

//   setPaymentDetails({
//     paymentDetails,
//     billingAddress,
//   }: {
//     paymentDetails: PaymentDetails;
//     billingAddress?: Address;
//   }): void {
//     this.paymentDetails = paymentDetails;

//     const details: PaymentDetails = { ...paymentDetails };
//     details.billingAddress = billingAddress ?? this.deliveryAddress;
//     this.busy$.next(true);
//     this.subscriptions.add(
//       this.checkoutPaymentFacade.createPaymentDetails(details).subscribe({
//         complete: () => {
//           // we don't call onSuccess here, because it can cause a spinner flickering
//           this.next();
//         },
//         error: () => {
//           this.onError();
//         },
//       })
//     );
//   }

//   next(): void {
//     this.checkoutStepService.next(this.activatedRoute);
//   }

//   back(): void {
//     this.checkoutStepService.back(this.activatedRoute);
//   }

//   protected savePaymentMethod(paymentDetails: PaymentDetails): void {
//     this.busy$.next(true);
//     this.subscriptions.add(
//       this.checkoutPaymentFacade.setPaymentDetails(paymentDetails).subscribe({
//         complete: () => this.onSuccess(),
//         error: () => this.onError(),
//       })
//     );
//   }

//   protected getCardIcon(code: string): string {
//     let ccIcon: string;
//     if (code === 'visa') {
//       ccIcon = this.iconTypes.VISA;
//     } else if (code === 'master' || code === 'mastercard_eurocard') {
//       ccIcon = this.iconTypes.MASTER_CARD;
//     } else if (code === 'diners') {
//       ccIcon = this.iconTypes.DINERS_CLUB;
//     } else if (code === 'amex') {
//       ccIcon = this.iconTypes.AMEX;
//     } else {
//       ccIcon = this.iconTypes.CREDIT_CARD;
//     }

//     return ccIcon;
//   }

//   protected createCard(
//     paymentDetails: PaymentDetails,
//     cardLabels: {
//       textDefaultPaymentMethod: string;
//       textExpires: string;
//       textUseThisPayment: string;
//       textSelected: string;
//     },
//     selected: PaymentDetails | undefined
//   ): Card {
//     // TODO: (CXSPA-6956) - Remove feature flag in next major release
//     const hideSelectActionForSelected = this.featureConfigService?.isEnabled(
//       'a11yHideSelectBtnForSelectedAddrOrPayment'
//     );
//     const isSelected = selected?.id === paymentDetails.id;

//     return {
//       role: 'region',
//       title: paymentDetails.defaultPayment
//         ? cardLabels.textDefaultPaymentMethod
//         : '',
//       textBold: paymentDetails.accountHolderName,
//       text: [paymentDetails.cardNumber ?? '', cardLabels.textExpires],
//       img: this.getCardIcon(paymentDetails.cardType?.code as string),
//       actions:
//         hideSelectActionForSelected && isSelected
//           ? []
//           : [{ name: cardLabels.textUseThisPayment, event: 'send' }],
//       header: isSelected ? cardLabels.textSelected : undefined,
//       label: paymentDetails.defaultPayment
//         ? 'paymentCard.defaultPaymentLabel'
//         : 'paymentCard.additionalPaymentLabel',
//     };
//   }

//   protected onSuccess(): void {
//     this.busy$.next(false);
//   }

//   protected onError(): void {
//     this.busy$.next(false);
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.unsubscribe();
//   }
// }
