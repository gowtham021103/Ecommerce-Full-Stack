import React, { Fragment, useState } from 'react';
import {Link} from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Cart({cartItems, setCartItems}) {
    
    const [complete, setComplete] = useState(false);

    async function placeOrderHandler() {
        const totalAmount = cartItems.reduce((acc, item) => (acc + item.product.price * item.qty), 0);

        // 1. Call Backend to create Razorpay Order
        const response = await fetch(import.meta.env.VITE_API_URL + '/payment/razorpay/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount })
            });
            const data = await response.json();

            if (!data.success) {
                toast.error("Failed to initiate payment gateway.");
                return;
            }

            // 2. Open Razorpay checkout interface
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter Key ID generated from Dashboard
                amount: data.order.amount,
                currency: "INR",
                name: "My E-Commerce",
                description: "Payment for order",
                order_id: data.order.id, // Razorpay Order ID from backend
                handler: async function (response) {
                    // This function executes on successful payment authorization
                    const paymentDetails = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        cartItems
                    };

                    // 3. Send payment tokens to backend to record order & adjust stocks
                    await fetch(import.meta.env.VITE_API_URL + '/order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(paymentDetails)
                    });

                    setCartItems([]);
                    setComplete(true);
                    toast.success("Order Placed Successfully!");
                },
                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#0399d4" // Theme accent matching your UI brand color
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        }




    function increaseQty(item){
            if (item.product.stock == item.qty){
                return;
            }
            const updatedItems = cartItems.map((i)=>{
                if(i.product._id == item.product._id){
                    i.qty++
                }
                return i;
            })
            setCartItems(updatedItems)
    }

    function decreaseQty(item){
        if (item.qty>1){
            const updatedItems = cartItems.map((i)=>{
                if(i.product._id == item.product._id){
                    i.qty--
                }
                return i;
            })
            setCartItems(updatedItems)
        }
        
    }

    function removeItem(item){
        
        const updatedItems = cartItems.filter((i)=>{
                if(i.product._id !== item.product._id){
                    return true;
                }
            })
        setCartItems(updatedItems)
    }



  return (
    cartItems.length>0 ? <Fragment>
        <div className="container container-fluid">
            <h2 className="mt-5">Your Cart: <b>{cartItems.length} items</b></h2>
            
            <div className="row d-flex justify-content-between">
                <div className="col-12 col-lg-8">
                    {cartItems.map((item)=>
                    <Fragment>
                        <hr />
                        <div className="cart-item">
                            <div className="row">
                                <div className="col-4 col-lg-3">
                                    <img src={item.product.image} alt={item.product.name} height="90" width="115" />
                                </div>

                                <div className="col-5 col-lg-3">
                                    <Link to={"/product/"+item.product._id} >{item.product.name}</Link>
                                </div>


                                <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                    <p id="card_item_price">Rs {item.product.price}</p>
                                </div>

                                <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                    <div className="stockCounter d-inline">
                                        <span className="btn btn-danger minus" onClick={()=>decreaseQty(item)}>-</span>
                                        <input type="number" className="form-control count d-inline" value={item.qty} readOnly />

                                        <span className="btn btn-primary plus" onClick={()=>increaseQty(item)}>+</span>
                                    </div>
                                </div>

                                <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                                    <i id="delete_cart_item" className="fa fa-trash btn btn-danger" onClick={()=> removeItem(item)}></i>
                                </div>

                            </div>
                        </div>    
                    </Fragment>  
                    )}
                </div>

                <div className="col-12 col-lg-3 my-4">
                    <div id="order_summary">
                        <h4>Order Summary</h4>
                        <hr />
                        <p>Subtotal:  <span className="order-summary-values">{cartItems.reduce((acc,item)=> (acc + item.qty),0)} (Units)</span></p>
                        <p>Est. total: <span className="order-summary-values">Rs {cartItems.reduce((acc,item)=> (acc +item.product.price * item.qty),0)}</span></p>
        
                        <hr />
                        <button id="checkout_btn" className="btn btn-primary btn-block" onClick={placeOrderHandler}>Place Order</button>
                    </div>
                </div>
            </div>
        </div>
    </Fragment> : (!complete ? <h2 className='mt-5'>Your Cart is Empty!</h2> 
    
    : <Fragment>
        <h2 className='mt-5'>Order Complete!</h2><p>Your Order has been placed Successfully.</p>
        </Fragment> )
    
  )
}
