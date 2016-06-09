const express = require('express')

const utils = require('./utils')

module.exports = (env, db) => {
  const router = express.Router()

  router.get('/subscriptions/:subscription_id/customer', (req, res) => {
    const subscriptionId = req.params.subscription_id
    const subscription = db('subscriptions').getById(subscriptionId)

    if (!subscription) {
      res.status(404).send('Subscription not found.')
    } else {
      res.json(subscription.customer)
    }
  })

  router.post('/subscriptions/:subscription_id/cancel', (req, res) => {
    const subscriptionId = req.params.subscription_id
    const subscription = db('subscriptions').updateById(subscriptionId, {
      cancelation_requested_at: new Date().toISOString()
    })

    if (!subscription) {
      res.status(404).send('Subscription not found.')
    } else {
      const notification = {
        notification_id: `notification_${subscriptionId}_cancelation_requested`,
        client_id: '',
        event: {
          type: 'subscription.cancelation_requested',
          id: `event_${subscriptionId}_cancelation_requested`,
          occurred_at: new Date().toISOString()
        },
        resource: {
          type: 'subscription',
          id: subscriptionId,
          current_state: subscription
        }
      }

      utils.createNotificationRequest(env, notification)
        .end((err) => {
          if (err) {
            res
              .status(500)
              .send(`An error occured while sending the notification: ${err}`)

            return
          }

          res.json(subscription)
        })
    }
  })

  router.post('/subscriptions/:subscription_id/update-payment', (req, res) => {
    const hostname = env.MOCK_SERVER_HOSTNAME || req.headers.host
    res.status(201).json({
      url: `http://${hostname}${req.baseUrl}/generated-update-payment-url`
    })
  })

  router.post('/subscriptions/:subscription_id/expire', (req, res) => {
    const subscriptionId = req.params.subscription_id
    const subscription = db('subscriptions').updateById(subscriptionId, {
      canceled_at: new Date().toISOString(),
      status: 'canceled'
    })

    if (!subscription) {
      res.status(404).send('Subscription not found.')
    } else {
      const notification = {
        notification_id: `notification_${subscriptionId}_cancelation_performed`,
        client_id: '',
        event: {
          type: 'subscription.cancelation_performed',
          id: `event_${subscriptionId}_cancelation_performed`,
          occurred_at: new Date().toISOString()
        },
        resource: {
          type: 'subscription',
          id: subscriptionId,
          current_state: subscription
        }
      }

      utils.createNotificationRequest(env, notification)
        .end((err) => {
          if (err) {
            res
              .status(500)
              .send(`An error occured while sending the notification: ${err}`)

            return
          }

          res.json(subscription)
        })
    }
  })

  return router
}
