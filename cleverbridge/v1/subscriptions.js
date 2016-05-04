const express = require('express')
const faker = require('faker')

const utils = require('./utils')

module.exports = (env, db) => {
  const router = express.Router()

  router.post('/subscriptions/:subscription_id/cancel', (req, res) => {
    const subscriptionId = req.params.subscription_id
    const subscription = db('subscriptions').updateById(subscriptionId, {
      cancelation_requested_at: new Date().toISOString(),
      canceled_at: faker.date.future()
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

  return router
}
