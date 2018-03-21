"use strict";

var express = require("express"),
    router = express.Router(),
    config = require("../../../config"),
    utils = require("../../../libs/utils"),
    userDAO = require("../../../core/dao/user-dao"),
    async = require("async"),
    consts = require("../../../libs/consts");

router.post('/update_password', function (req, res, next){
	var username = req.session.user.user.username;
	
	userDAO.updatePassword(username, req.body.password, function (err, success){
		if (success)
		{
			req.session.user.user.password = req.body.password;
			req.session.save();
			
			return utils.successResponse(success, res, next);
		}
	});
});

module.exports = router;