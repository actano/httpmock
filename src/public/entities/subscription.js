var createSubscriptionEntity = function (nga) {
  var subscription = nga.entity('subscriptions')
    .baseApiUrl('/cleverbridge/v1/')

  subscription.listView()
    .fields([
      nga.field('subscription_id')
        .isDetailLink(true),
      nga.field('customer.your_customer_id'),
      nga.field('status'),
      nga.field('started_at', 'datetime'),
      nga.field('cancelation_requested_at', 'datetime'),
      nga.field('canceled_at', 'datetime')
    ])
    .listActions([
      'edit',
      'delete',
      '<request-subscription-cancelation-button size="xs" subscription="entry"></request-subscription-cancelation-button>',
      '<expire-subscription-button size="xs" subscription="entry"></expire-subscription-button>'
    ])

  subscription.editionView()
    .fields([
      nga.field('subscription_id')
        .editable(false),
      nga.field('customer.your_customer_id'),
      nga.field('status', 'choice')
        .choices([
          {value: 'active', label: 'active'},
          {value: 'canceled', label: 'canceled'},
          {value: 'new', label: 'new'}
        ]),
      nga.field('started_at', 'datetime'),
      nga.field('next_renewal_at', 'datetime'),
      nga.field('next_billing_at', 'datetime'),
      nga.field('cancelation_requested_at', 'datetime'),
      nga.field('canceled_at', 'datetime')
    ])
    .actions([
      'list',
      'delete',
      '<request-subscription-cancelation-button subscription="entry"></request-subscription-cancelation-button>',
      '<expire-subscription-button subscription="entry"></expire-subscription-button>'
    ])

  return subscription
}
