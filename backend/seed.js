const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDatabase = require('./config/connectDatabase');
const ProductModel = require('./models/productModel');
const products = require('./data/products.json');

dotenv.config({path: './config/config.env'});

connectDatabase();

const seedProducts = async () => {
    try {
        await ProductModel.deleteMany();
        console.log('Products deleted');

        await ProductModel.insertMany(products);
        console.log('All products added');

        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

seedProducts();
