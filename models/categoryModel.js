const mongoose = require('mongoose');


// 1- create schema
const  categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Category Required'],
        unique: [true,'Category must be unique'],
        minLength: [3, 'Too short Category name'],
        maxLength: [32, 'Too long Category name'],
    },
    slug: {
        type: String,
        Lowercase: true,
    },
    image: String,
},
 {timestamps: true }
);

// 2-  create model
const CategoryModel = mongoose.model('Category', categorySchema);


module.exports = CategoryModel;