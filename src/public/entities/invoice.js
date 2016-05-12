var createInvoiceEntity = function (nga) {
  var invoice = nga.entity('invoices')
    .baseApiUrl('/cleverbridge/v1/')

  invoice.listView()
    .fields([
      nga.field('id')
        .isDetailLink(true),
      nga.field('customer_id'),
      nga.field('created_at', 'datetime')
    ])
    .listActions([
      'edit',
      'delete'
    ])

  invoice.editionView()
    .fields([
      nga.field('id')
        .editable(false),
      nga.field('customer_id'),
      nga.field('created_at', 'datetime'),
      nga.field('currency_iso_code'),
      nga.field('gross'),
      nga.field('type')
    ])
    .actions([
      'list',
      'delete'
    ])

  return invoice
}
