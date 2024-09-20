const product = require('../models/product.js');
const Product = require('../models/product.js');

//get all products
exports.allProducts = async (req, res) => {
    const products = await Product.find();
    res.status(200).json({ products });
};


// get details of a product
exports.detailProducts = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ product });
};

//create a new product
exports.createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
};

//delete a product
exports.deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    product.remove();
    res.status(200).json({ message: 'Product deleted' });
}

module.exports = { allProducts, detailProducts, createProduct, deleteProduct };