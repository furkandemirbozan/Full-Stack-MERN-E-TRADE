const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const db = require('./config/db');
const product = require('./routes/product.js');
const user = require('./routes/user.js');
const cloudinary = require('cloudinary').v2;

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY, // Click 'View API Keys' above to copy your API key
    api_secret: process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser());



app.use('/', product);
app.use('/', user);


db()

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});