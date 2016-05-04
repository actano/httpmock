const bodyParser = require('body-parser')
const express = require('express')
const faker = require('faker')
const get = require('lodash/fp/get')
const querystring = require('querystring')
const request = require('superagent')

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
    const notificationUrl = env.MOCK_NOTIFICATION_URL
    const notificationUsername = env.MOCK_NOTIFICATION_USERNAME
    const notificationPassword = env.MOCK_NOTIFICATION_PASSWORD

    const subscriptionId = faker.random.uuid()
    const subscriptionRenewalDate = faker.date.future()
    const subscription = {
      customer: {
        your_customer_id: req.query.user_id,
        status: 'active'
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

    request
      .post(notificationUrl)
      .auth(notificationUsername, notificationPassword)
      .send(notification)
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
