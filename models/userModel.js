// require same modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const Schema = mongoose.Schema;

mongoose.Promise = require("bluebird");

let UserSchema = new Schema({
    username: {
       type: String,
       default:"serputoff@gmail.com"
    },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password cannot contain "password"');
      }
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

module.exports = mongoose.model("Users", UserSchema);






// // require mongoose and setup the Schema
// const mongoose = require("mongoose");
// const { stringify } = require("querystring");
// const Schema = mongoose.Schema;

// // use bluebird promise library with mongoose
// mongoose.Promise = require("bluebird");

// // car model
// const userSchema = new Schema({
//     "username": {
//         type: String,
//         unique: true },
//     "password": String,
//     "firstName": String,
//     "lastName": String,
//     "email": {
//         type: String,
//         unique: true },
//     "isAdmin": Boolean
// });

// module.exports = mongoose.model("users", userSchema);