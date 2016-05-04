const express = require('express')
const jsonServer = require('json-server')

const authentication = require('./authentication')
const invoices = require('./invoices')
const signup = require('./signup')
const subscription = require('./subscriptions')

module.exports = (env, dbSource) => {
  const jsonServerRouter = jsonServer.router(dbSource)
  const router = express.Router()

  router.use(authentication(env, jsonServerRouter.db))
  router.use(signup(env, jsonServerRouter.db))
  router.use(subscription(env, jsonServerRouter.db))
  router.use(invoices(env, jsonServerRouter.db))
  router.use(jsonServerRouter)

  return router
}
