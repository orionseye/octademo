(function() {
  'use strict';

  var elements = stripe.elements({
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
      },
    ],
    // Stripe's examples are localized to specific languages, but if
    // you wish to have Elements automatically detect your user's locale,
    // use `locale: 'auto'` instead.
    locale: window.__exampleLocale
  });

  var card = elements.create('card', {
    hidePostalCode: true,
	iconStyle: 'solid',
    style: {
      base: {
        iconColor: '#14b3b3',
        color: '#858080',
        fontWeight: 500,
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',

        ':-webkit-autofill': {
          color: '#858080',
        },
        '::placeholder': {
          color: '#d5d5d5',
        },
      },
      invalid: {
        iconColor: '#ff5f5f',
        color: '#ff5f5f',
      },
    },
  });
  card.mount('#example1-card');

  registerElements([card], 'example1');
})();
