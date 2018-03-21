"use strict";

var express = require("express"),
    router = express.Router(),
    config = require("../../../config"),
    utils = require("../../../libs/utils"),
    userDAO = require("../../../core/dao/user-dao"),
    tbuserDAO = require("../../../core/dao/tbuser-dao"),
    profileDAO = require("../../../core/dao/profile-dao"),
    async = require("async"),
    checkAuth = require("../../../core/user/check-auth"),
    consts = require("../../../libs/consts");

// router.post("/register", function(req, res, next){

//     userDAO.addUser(req.body, function(err, suc){
//         if(err){
//             res.redirect("/admin")
//         }else{
//             res.redirect("/admin")
//         }
//     })
// })


router.post('/', function(req, res, next) {
    var userinfo = req.body;
    var status = 0;

    userDAO.authenticate(userinfo, function (err, finduser){
        if (finduser)
        {
            req.session.user = {
                user: userinfo,
                userType: finduser.user_type
            }
            req.session.save();
        }

        res.redirect('/admin');
    });
});

router.get("/", function(req, res, next) {
    var status = 0;
    checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
             async.parallel({
                users: function(callback) {
                    tbuserDAO.getAllUsers(function (error, success) {
                        if(error) {
                            callback(error, success);
                        }
                        else {
                            callback(null, success);
                        }
                    });
                },
                
            },
            function (err, results) {
                if(err) {
                    res.render("admin/user/user", {page: 'user', results: null});
                } else {
                    res.render("admin/user/user", {page: 'user', results: results});
                }
            });
        }
    });
});

router.get("/login", function(req, res, next) {
    res.render("admin/login");
});

router.get('/logout', function (req, res, next){
	utils.destroySession(req);
	res.redirect('/admin');
});

module.exports = router;