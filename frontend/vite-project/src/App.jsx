import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import ProductDetails from './pages/ProductDetails';
import {ToastContainer} from 'react-toastify';
import Cart from './pages/Cart'


function App() {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('cartItems');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Router>
      <ToastContainer theme='dark' position='bottom-center'/>
      <Header cartItems={cartItems} />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/search" element={<Home/>} />
        <Route path="/product/:id" element={<ProductDetails cartItems={cartItems} setCartItems={setCartItems} />} />
        <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems}/>} />
      </Routes>
      <Footer/>
    </Router>
  )
}

export default App
