"use strict";

var config = require("../config"),
	consts = require("../libs/consts"),
	mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	Schema = mongoose.Schema;

module.exports = function (){
	var userSchema = new Schema({
		username: {type: String, required: true},
		password: {type: String, required: true},
		user_type: {type: String, default: null}
	});

	userSchema.plugin(uniqueValidator, {error: "Error, expected {PATH} to be unique."});

	userSchema.set("toJSON", {virtuals: true});
	userSchema.set("toObject", {virtuals: true});

	mongoose.model("user", userSchema);
}