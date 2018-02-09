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
      plan_id: get(['body', 'plan_id'], req),
      locale: get(['body', 'contact', 'locale'], req),
      mvt_campaign: get(['body', 'mvt_campaign'], req)
    })

    res.status(201).json({
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
          locale: req.query.locale,
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
          card_last_four_digits: `${faker.random.number({min: 1000, max: 9999})}`,
          card_expiration_date: `${creditCardExpirationDate.getMonth()}/${creditCardExpirationDate.getFullYear()}`
        },
        remote_ip: faker.internet.ip()
      },
      id: subscriptionId, // for mock retrieval
      billing_cycle_frequency: '6m',
      currency_iso_code: 'EUR',
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
    const invoiceId = `${faker.random.number({min: 100000000, max: 999999999})}`
    const invoice = {
      currency_iso_code: 'EUR',
      customer_id: subscription.customer.your_customer_id,
      created_at: subscription.started_at,
      document_url: `/v1/customers/${subscription.customer.your_customer_id}/invoices/${invoiceId}`,
      gross: faker.finance.amount(),
      id: invoiceId,
      payment_provider_invoice_id: invoiceId,
      type: 'charge'
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
    const mvt_campaign = req.query.mvt_campaign

    db('subscriptions').push(subscription)
    db('invoices').push(invoice)

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
            locale: ${subscription.customer.default_contact.locale}
            mvt_campaign: ${mvt_campaign}
            `)
      })
  })

  return router
}
