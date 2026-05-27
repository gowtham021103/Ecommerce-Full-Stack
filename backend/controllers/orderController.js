const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : '',
    key_secret: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : ''
});

// create order - /api/v1/order
exports.createOrder = async (req,res,next)=>{
    const cartItems = Array.isArray(req.body) ? req.body : req.body.cartItems;

    if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({
            success: false,
            message: "Cart items are required and must be an array."
        });
    }

    const amount = Number(cartItems.reduce((acc,item)=>(item.product.price * item.qty), 0)).toFixed(2);
    const status = 'pending';

    const order = await orderModel.create({
        cartItems,
        amount,
        status,
        createdAt: new Date()
    });

    // Updating Product Stock
    cartItems.forEach(async(item)=>{
        try {
            if (item.product && item.product._id) {
                const product = await productModel.findById(item.product._id);
                if (product) {
                    product.stock = String(Number(product.stock) - Number(item.qty));
                    await product.save();
                }
            }
        } catch (err) {
            console.error("Error updating stock for product ID:", item?.product?._id, err.message);
        }
    })
    
    res.json(
        {
        success: true,
        order
        }
    )
}

// Create Razorpay Order - /api/v1/payment/razorpay/order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Total price in Rupees
        
        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };
        const order = await razorpayInstance.orders.create(options);
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders - /api/v1/orders
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await orderModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};