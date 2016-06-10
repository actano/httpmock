const express = require('express')
const faker = require('faker')
const merge = require('lodash/merge')

module.exports = (env, db) => {
  const router = express.Router()

  router.get('/generated-update-payment-url', (req, res) => {
    const creditCardExpirationDate = faker.date.future()
    const subscriptionId = req.query.subscriptionId
    const subscription = db('subscriptions').getById(subscriptionId)

    const mergedSubscription = merge(subscription, {
      customer: {
        payment_information: {
          card_last_four_digits: `${faker.random.number({min: 1000, max: 9999})}`,
          card_expiration_date: `${creditCardExpirationDate.getMonth()}/${creditCardExpirationDate.getFullYear()}`
        }
      }
    })

    db('subscriptions').updateById(subscriptionId, mergedSubscription)

    res.status(201).send(`Updated subscription ${subscriptionId}`)
  })

  return router
}
