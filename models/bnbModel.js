// require mongoose and setup the Schema
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const Schema = mongoose.Schema;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// car model
const carSchema = new Schema({
    "_id": {
        type: Number
    },
    "year": Number,
    "make": String,
    "model": String,
    "VIN": String,
    "colour": String,
});

module.exports = mongoose.model("bnb", carSchema);