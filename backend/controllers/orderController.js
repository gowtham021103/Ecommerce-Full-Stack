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
        const product = await productModel.findById(item.product._id);
        if (product) {
            product.stock = product.stock - item.qty;
            await product.save();
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