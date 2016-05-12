var createPlanEntity = function (nga) {
  var plan = nga.entity('plans')
    .baseApiUrl('/cleverbridge/v1/')

  plan.listView()
    .fields([
      nga.field('id')
        .isDetailLink(true),
      nga.field('plan_version', 'number'),
      nga.field('name')
    ])
    .listActions([
      'edit',
      'delete'
    ])

  plan.editionView()
    .fields([
      nga.field('id')
        .editable(false),
      nga.field('plan_version', 'number'),
      nga.field('name')
    ])
    .actions([
      'list',
      'delete'
    ])

  return plan
}
