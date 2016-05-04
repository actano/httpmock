const bodyParser = require('body-parser')
const express = require('express')
const faker = require('faker')
const get = require('lodash/fp/get')
const querystring = require('querystring')

const utils = require('./utils')

module.exports = (env, db) => {
  const router = express.Router()

  router.use(bodyParser.json({
    limit: '10mb'
  }))

  router.post('/signup-urls', (req, res) => {
    const hostname = env.MOCK_SERVER_HOSTNAME || req.headers.host
    const query = querystring.stringify({
      user_id: get(['body', 'your_customer_id'], req),
      plan_id: get(['body', 'plan_id'], req)
    })

    res.json(201, {
      url: `http://${hostname}${req.baseUrl}/perform-signup?${query}`
    })
  })

  router.get('/perform-signup', (req, res) => {
    const subscriptionId = faker.random.uuid()
    const subscriptionRenewalDate = faker.date.future()
    const creditCardExpirationDate = faker.date.future()
    const subscription = {
      customer: {
        your_customer_id: req.query.user_id,
        default_currency_iso_code: 'EUR',
        default_contact: {
          locale: 'en-US',
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          company: faker.company.companyName(),
          street: faker.address.streetName(),
          zip_code: faker.address.zipCode(),
          city: faker.address.city(),
          country_iso_code: 'US',
          email: faker.internet.email()
        },
        payment_information: {
          payment_method: 'visa',
          card_last_four_digits: faker.random.number({min: 1000, max: 9999}),
          card_expiration_date: `${creditCardExpirationDate.getMonth()}/${creditCardExpirationDate.getFullYear()}`
        },
        remote_ip: faker.internet.ip()
      },
      id: subscriptionId, // for mock retrieval
      next_billing_at: subscriptionRenewalDate,
      next_renewal_at: subscriptionRenewalDate,
      plans: [
        {
          plan_id: req.query.plan_id,
          plan_version: 0,
          quantity: 1
        }
      ],
      renewal_type: 'auto',
      started_at: new Date().toISOString(),
      status: 'active',
      subscription_id: subscriptionId
    }
    const notification = {
      notification_id: `notification_${subscriptionId}_created`,
      client_id: '',
      event: {
        type: 'subscription.created',
        id: `event_${subscriptionId}_created`,
        occurred_at: subscription.started_at
      },
      resource: {
        type: 'subscription',
        id: subscriptionId,
        current_state: subscription
      }
    }

    db('subscriptions').push(subscription)

    utils.createNotificationRequest(env, notification)
      .end((err) => {
        if (err) {
          res
            .status(500)
            .send(`An error occured while sending the notification: ${err}`)

          return
        }

        res
          .status(200)
          .send(`The following subscription has been created:
            subscription_id: ${subscription.subscription_id}
            plan_id: ${subscription.plans[0].plan_id}
            user_id: ${subscription.customer.your_customer_id}
            `)
      })
  })

  return router
}
