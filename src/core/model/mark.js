var mongoose = require('mongoose');

var MarkSchema = new mongoose.Schema({
    car: {type: String, ref: 'Car'},
    isChecked: {type: Boolean, default: false},
    votes: {type: Number, default: 0}
});

module.exports = MarkSchema;