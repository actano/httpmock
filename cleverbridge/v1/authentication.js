const express = require('express')

module.exports = (env, db) => {
  const router = express.Router()

  router.get('/customer-token-cookie', (req, res) => {
    res.redirect(req.query.redirect)
  })

  router.post('/customer-tokens', (req, res) => {
    res.status(201).json({
      expiration_date: '2100-12-31T23:59:59.000Z',
      token: 'STUB_TOKEN'
    })
  })

  return router
}
