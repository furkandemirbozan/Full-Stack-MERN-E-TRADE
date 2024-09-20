const mongoose = require('mongoose');


const db = () => {
    mongoose.connect("mongodb+srv://furkan97demirbozan:furkan97demirbozan@cluster0.a0emr.mongodb.net/", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("MongoDB connected");
    }).catch((err) => {
        console.log("MongoDB connection error", err);
    });
}

module.exports = db;