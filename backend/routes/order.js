const express = require("express");
const { createOrder, createRazorpayOrder } = require("../controllers/orderController");
const router = express.Router();

router.route("/order").post(createOrder);

router.route('/payment/razorpay/order').post(createRazorpayOrder);


module.exports = router;