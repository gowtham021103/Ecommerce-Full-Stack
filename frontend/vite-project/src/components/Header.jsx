import React from 'react'
import logo from '../images/logo.png'
import Search from './Search'
import { Link } from 'react-router-dom'

export default function Header({cartItems}) {
  return (
    <nav className="navbar row py-3 px-4 align-items-center">
        <div className="col-12 col-md-3 text-center text-md-left">
            <div className="navbar-brand">
                <Link to="/"> <img width="140px" src={logo} alt="Logo" /></Link>
            </div>
        </div>

        <div className="col-12 col-md-6 mt-2 mt-md-0">
            <Search/>
        </div>

        <div className="col-12 col-md-3 mt-3 mt-md-0 text-center text-md-right">
            <Link to={"/cart"} className="text-decoration-none d-inline-block">
                <span id="cart" className="align-middle">
                    <i className="fa fa-shopping-cart mr-2" aria-hidden="true" style={{ fontSize: '1.2rem', color: '#0399d4' }}></i>Cart
                </span>
                <span className="ml-2" id="cart_count">{cartItems.length}</span>
            </Link>
        </div>
    </nav>
  )
}