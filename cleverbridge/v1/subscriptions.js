const express = require('express');


module.exports = (env, db) => {
    const router = express.Router();

    router.get('/subscriptions/:subscription_id/cancel', (req, res) => {
        const subscriptionId = req.params.subscription_id;
        const subscription = db('subscriptions').updateById(subscriptionId, {
            cancelation_requested_at: new Date().toISOString(),
        });

        if (!!subscription) {
            res.json(200, subscription);
        } else {
            res.json(404, 'Subscription not found.');
        }
    });

    return router;
}
