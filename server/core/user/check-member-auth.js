"use strict";

var memberDAO = require("../dao/tbuser-dao"),
    consts = require("../../libs/consts");

module.exports = function(req, res, next, callback) {
    if (typeof req.session.user == 'undefined' || typeof req.session.user.loginuser == 'undefined') {
        callback({error: "No session info"}, null);
    } else {
        memberDAO.validationSession(req.session.user.loginuser, function (findUserErr, findUser) {
            
            if (findUserErr) {
                callback(findUserErr, null);
            } else {
                callback(null, findUser);
            }
        });
    }
};