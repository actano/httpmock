const request = require('superagent')

const createNotificationRequest = (env, notification) => {
  const notificationUrl = env.MOCK_NOTIFICATION_URL
  const notificationUsername = env.MOCK_NOTIFICATION_USERNAME
  const notificationPassword = env.MOCK_NOTIFICATION_PASSWORD

  return request
    .post(notificationUrl)
    .auth(notificationUsername, notificationPassword)
    .send(notification)
}

module.exports = {
  createNotificationRequest
}
