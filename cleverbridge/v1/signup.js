const bodyParser = require('body-parser');
const express = require('express');
const get = require('lodash/fp/get');
const querystring = require('querystring');
const uuid = require('uuid');


module.exports = (env, db) => {
    const router = express.Router();

    router.use(bodyParser.json({
        limit: '10mb',
    }));

    router.post('/signup-urls', (req, res) => {
        const hostname = env.MOCK_SERVER_HOSTNAME || req.headers.host
        const query = querystring.stringify({
            user_id: get(['body', 'your_customer_id'], req),
            plan_id: get(['body', 'plan_id'], req),
        });

        res.json(201, {
            url: `http://${hostname}${req.baseUrl}/perform-signup?${query}`,
        });
    });

    router.get('/perform-signup', (req, res) => {
        const subscriptionId = uuid();
        const subscription = {
            customer: {
                your_customer_id: req.query.user_id,
                status: 'active',
            },
            id: subscriptionId,  // for mock retrieval
            plans: [
                {
                    plan_id: req.query.plan_id,
                    plan_version: 0,
                    quantity: 1,
                },
            ],
            renewal_type: 'auto',
            started_at: new Date().toISOString(),
            subscription_id: subscriptionId,
        };

        db('subscriptions').push(subscription);

        res.set(200);
        res.send(`The following subscription has been created:
        subscription_id: ${subscription.subscription_id}
        plan_id: ${subscription.plans[0].plan_id}
        user_id: ${subscription.customer.user_id}
        `);
    });

    return router;
}
