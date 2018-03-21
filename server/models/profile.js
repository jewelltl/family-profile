var bcrypt = require("bcryptjs"),
    config = require("../config"),
    consts = require("../libs/consts"),
    mongoose = require("mongoose"),
    ObjectId = mongoose.Types.ObjectId,
    uniqueValidator = require("mongoose-unique-validator"),
    Schema = mongoose.Schema;

module.exports = function() {

	var dataSchema = new Schema({
        name: { type: String, required: true, trim: true },
		oldavatar: { type: String, required: true},
		currentavatar: { type: String, required: true},
		photos: { type: String, trim: true},
		memory: { type: String, trim: true },
		changes: { type: String, trim: true },
		profession: { type: String, trim: true },
		favorite: { type: String, trim: true },
		reflection: { type: String, trim: true },
		created_at: { type: Number,required: true, default: Date.now()},
		user_id: {type: Schema.ObjectId, unique: true, ref: 'tb_user'}
	});

	dataSchema.plugin(uniqueValidator, { message: "Error, expected {PATH} to be unique." });

    dataSchema.set("toJSON", { virtuals: true });
    dataSchema.set("toObject", { virtuals: true });

    mongoose.model("tb_profile", dataSchema);
};