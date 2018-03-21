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
    fs = require('fs-extra'),
    consts = require("../../../libs/consts"),
    emailer = require("../../../libs/emailer"),
    path           = require('path'),
    uploadsDir   = path.resolve(__dirname, '../../../../public/uploads/');

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

router.get("/create", function(req, res, next) {
    
    checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
            res.render("admin/user/create", {page: 'users'});
        }
    });
});

router.get("/edit", function(req, res, next) {
    
    checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
            tbuserDAO.getUserByID(req.query.id,function(err, suc){
                if(err){
                    res.redirect("/admin")
                }else{
                    res.render("admin/user/edit", {page: 'users', user: suc});        
                }
            })
        }
    });
});
router.get("/invite", function(req, res, next){
   checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
            var users = req.param('users').split(",").clean("")
            tbuserDAO.getUsersByIDs(users, function(err, suc){
                if(suc){
                    function sendMultipleEmail(stuffs, callback) {
                        stuffs.forEach(function(stuff){
                            emailer.sendInvitationEmail(stuff, function(error, succcess){
                                console.log(succcess)
                            })    
                        })  
                        callback();
                    } 
                    sendMultipleEmail(suc, function() {
                      res.redirect("/admin")
                    });
                }else{
                    res.redirect("/admin");    
                }
                
            })
        }
    }); 
})
router.get("/publish", function(req, res, next){
   checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
            res.download(consts.PPTX_URL + "admin_ppt.pptx");
        }
    }); 
})





router.get("/delete", function(req, res, next) {
    checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
            tbuserDAO.deleteUserById(req.query.id, function (err, success){
                res.redirect("/admin")
            });
        }
    });
});



module.exports = router;