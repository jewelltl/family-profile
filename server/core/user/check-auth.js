"use strict";

var userDAO = require("../dao/user-dao"),
    consts = require("../../libs/consts");

module.exports = function(req, res, next, callback) {
    if (typeof req.session.user == 'undefined' || typeof req.session.user.user == 'undefined') {
        callback({error: "No session info"}, null);
    } else {
        
        userDAO.authenticate(req.session.user.user, function (findUserErr, findUser) {
            if (findUserErr) {
                callback(findUserErr, null);
            } else {
                callback(null, findUser)
            }
        });
    }
};