const express = require('express')
const faker = require('faker')

module.exports = (env, db) => {
  const router = express.Router()

  router.get('/generated-update-payment-url', (req, res) => {
    const creditCardExpirationDate = faker.date.future()
    const subscriptionId = req.query.subscriptionId

    db('subscriptions').updateById(subscriptionId, {
      customer: {
        payment_information: {
          card_last_four_digits: `${faker.random.number({min: 1000, max: 9999})}`,
          card_expiration_date: `${creditCardExpirationDate.getMonth()}/${creditCardExpirationDate.getFullYear()}`
        }
      }
    })

    res.status(201).send(`Updated subscription ${subscriptionId}`)
  })

  return router
}
