const express = require('express')

module.exports = (env, db) => {
  const router = express.Router()

  router.get('/customers/:customer_id/invoices', (req, res) => {
    const customerId = req.params.customer_id
    const invoices = db('invoices')
      .filter({
        customer_id: customerId
      })

    res.json(invoices)
  })

  return router
}
