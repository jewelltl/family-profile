"use strict";

var express = require("express"),
    expSession = require("express-session"),
    router = express.Router(),
    config = require("../../../config"),
    profileDAO = require("../../../core/dao/profile-dao"),
    tbUserDAO = require("../../../core/dao/tbuser-dao"),
    checkMemberAuth = require("../../../core/user/check-member-auth"),
    DateDiff  = require('date-diff'),
    utils = require("../../../libs/utils"),
    consts = require("../../../libs/consts"),
    path           = require('path'),
    fs = require("fs-extra"),
    
    // pptx = require('pptxgenjs'),
    emailer = require("../../../libs/emailer");


router.get("/", function(req, res, next) {
    res.render("client/index", {page: 'index', left: calcDiffDate(new Date(consts.END_DATE), Date.now())})
});

router.get('/login', function(req, res, next){
    

    tbUserDAO.getAllUsers(function(err, suc){
        if(err){
            res.render("client/login", {users: null, page: 'login', left: calcDiffDate(new Date(consts.END_DATE), Date.now()) });    
        }else{
            res.render("client/login", {users: suc, page: 'login', left: calcDiffDate(new Date(consts.END_DATE), Date.now()) });        
        }
        
    })
    
})

router.get("/profile", function(req, res, next) {

	checkMemberAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.redirect("/login");
        } else {
            profileDAO.getProfileByEmailID(currentUser._id, function(err, suc){
                
                if (suc != null){
                    if(typeof suc.photos != "undefined"){
                         var photos = suc.photos.split(",").clean("")
                     }else{
                         var photos = []
                     }

                     res.render("client/profile", {user: currentUser, profile: suc, photos: photos, page: 'profile'});      
                }else{

                    profileDAO.addProfile({user_id: currentUser._id}, function(addErr, addSuc){
                        res.render("client/profile", {user: currentUser, profile: addSuc, page: 'profile', photos: []});     
                    })
                }
            })
        }
    });
});


router.get("/publish", function(req, res, next){
    checkMemberAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.redirect("/login");
        } else {
            profileDAO.getProfileByEmailID(req.session.user.loginuser._id, function(err, suc){
                if(suc){
                    res.download(consts.PPTX_URL + suc._id + ".pptx");
                }
            })
            
        }
    });

})
router.get("/emailtest", function(req, res, next) {
    emailer.sendInvitationEmail(req.session.user.loginuser, function (emailErr, result) {
        if (err) {
            res.redirect("/");
        }
        else {
            res.redirect("/");
        }
    });
});




router.get('/logout', function (req,res,next) {
    if(typeof req.session.user == 'undefined') {
        res.redirect('/');
    } else {

        req.session.cookie.expires = false;
        req.session.cookie.maxAge = -1000;
        req.session.destroy(function(err) {
            if(!err) {
                res.redirect('/logout');
            }
        });
    }
});


function calcDiffDate(to, from){
    var diff = new DateDiff(to, from);
    return Math.ceil(diff.days());
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};


module.exports = router;