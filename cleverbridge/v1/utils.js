const request = require('superagent')

const createNotificationRequest = (env, notification) => {
  const notificationUrl = env.MOCK_NOTIFICATION_URL ||
    'http://rplan:8081/api/payments/notification'
  const notificationUsername = env.MOCK_NOTIFICATION_USERNAME ||
    'cleverbridge'
  const notificationPassword = env.MOCK_NOTIFICATION_PASSWORD ||
    ''

  return request
    .post(notificationUrl)
    .auth(notificationUsername, notificationPassword)
    .send(notification)
}

module.exports = {
  createNotificationRequest
}
