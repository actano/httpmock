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
    const notificationType = 'cancelation_requested'
    const subscriptionId = req.params.subscription_id
    const subscription = db('subscriptions').updateById(subscriptionId, {
      cancelation_requested_at: new Date().toISOString()
    })

    sendNotification(subscriptionId, subscription, notificationType, res)
  })

  router.post('/subscriptions/:subscription_id/update-payment', (req, res) => {
    const subscriptionId = req.params.subscription_id
    const hostname = env.MOCK_SERVER_HOSTNAME || req.headers.host

    res.status(201).json({
      url: `http://${hostname}${req.baseUrl}/generated-update-payment-url?subscriptionId=${subscriptionId}`
    })
  })

  router.post('/subscriptions/:subscription_id/expire', (req, res) => {
    const notificationType = 'cancelation_performed'
    const subscriptionId = req.params.subscription_id
    const subscription = db('subscriptions').updateById(subscriptionId, {
      canceled_at: new Date().toISOString(),
      status: 'canceled'
    })

    sendNotification(subscriptionId, subscription, notificationType, res)
  })

  function sendNotification (subscriptionId, subscription, notificationType, res) {
    if (!subscription) {
      res.status(404).send('Subscription not found.')
    } else {
      const notification = createNotification(subscriptionId, subscription, notificationType)

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
  }

  function createNotification (subscriptionId, subscription, notificationType) {
    return {
      notification_id: `notification_${subscriptionId}_${notificationType}`,
      client_id: '',
      event: {
        type: `subscription.${notificationType}`,
        id: `event_${subscriptionId}_${notificationType}`,
        occurred_at: new Date().toISOString()
      },
      resource: {
        type: 'subscription',
        id: subscriptionId,
        current_state: subscription
      }
    }
  }

  return router
}
