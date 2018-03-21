"use strict";

var config = require("../config"),
	consts = require("../libs/consts"),
	mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	Schema = mongoose.Schema;

module.exports = function (){
	var tbuserSchema = new Schema({
		username: {type: String, required: true},
		email: {type: String, required: true, unique:true},
		password: {type: String, required: true},
		active: {type: Number, required: true, default: 0}
	});

	tbuserSchema.plugin(uniqueValidator, {error: "Error, expected {PATH} to be unique."});

	tbuserSchema.set("toJSON", {virtuals: true});
	tbuserSchema.set("toObject", {virtuals: true});

	mongoose.model("tb_user", tbuserSchema);
}