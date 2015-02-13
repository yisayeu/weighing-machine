var mongoose = require('mongoose');

var CarSchema = new mongoose.Schema({
    _id: {type: String, index: {unique: true}},
    manufacturer: String,
    model: String,
    price: Number,
    year: Number,
    run: Number,
    transmission: String,
    modification: String,
    updatedAt: Date,
    description: String,
    kit: Array,
    url: String,
    weight: Number,
    weightComponents: Object
});

module.exports = CarSchema;