const Product = require('../models/product.js');
const ProductFilter = require('../models/product.js');
const cloudinary = require('cloudinary').v2;

//get all products
const allProducts = async (req, res) => {
    const resultPerPage = 10;
    const productFilter = new ProductFilter(Product.find(), req.query).search().filter().pagination(resultPerPage);

    const products = await productFilter.query;
    res.status(200).json({ products });
};

const adminProducts = async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({ products });
};


// get details of a product
const detailProducts = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ product });
};

//create a new product admin
const createProduct = async (req, res, next) => {
    let images = [];
    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }
    let allImage = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
            folder: 'products'
        });
        allImage.push({ public_id: result.public_id, url: result.secure_url });
    }

    req.body.images = allImage;

    const product = await Product.create(req.body);
    res.status(201).json({ product });
};

//delete a product
const deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    product.remove();

    res.status(200).json({ message: 'Product deleted' });
}

const updateProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    let images = [];
    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }
    if (images !== undefined) {
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.uploader.destroy(product.images[i].public_id);
        }
    }
    let allImage = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i], {
            folder: 'products'
        });
        allImage.push({ public_id: result.public_id, url: result.secure_url });
    }

    req.body.images = allImage;
    req.body.user = req.user.id;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ message: 'Product deleted' });
}


const createReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };
    const product = await Product.findById(productId);

    product.reviews.push(review);
    let avg = 0;
    product.forEach(rev => {
        avg += rev.rating;
    });

    product.rating = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ message: 'Yorum başarıyla eklendi' });

}



module.exports = { allProducts, detailProducts, createProduct, deleteProduct, updateProduct, createReview, adminProducts };