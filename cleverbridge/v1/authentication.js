const express = require('express')

module.exports = (env, db) => {
  const router = express.Router()

  router.get('/customer-token-cookie', (req, res) => {
    res.redirect(req.query.redirect)
  })

  return router
}
