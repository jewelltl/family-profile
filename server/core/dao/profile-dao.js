"use strict";

var mongoose = require("mongoose"),
    Profile = mongoose.model("tb_profile"),
    tbUser = mongoose.model("tb_user"),

    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    bcrypt = require("bcryptjs"),
    consts = require("../../libs/consts");


function getAllProfiles(callback) {
    Profile.find({$query: {}, $orderby:{_id:-1}}, function (err, findData) {
        if(err) {
            callback(err, null);
        }
        else {
            if(findData) {
                callback(null, findData);
            }
            else {
                callback({error: "Empty Data"}, null);
            }
        }
    })
}



function addProfile(data, callback) {
    data.user_id = new ObjectId(data.user_id);
    
    Profile.collection.save(data, function (addErr, addSuccess) {
    
    
        if (addErr) {
            callback(addErr, null);
        } else {
            Profile.findOne({user_id : data.user_id}, function(err, suc){
                callback(err, suc)
            })    
        }                    
    });
}
function updateProfile(data, login_id, callback) {
    Profile.update({_id: data._id}, data, function (addErr, addSuccess) {
        
        if (addErr) {
            callback(addErr, null);
        } else {
            tbUser.update({_id: login_id}, {active: 1},  function(error, success){
                Profile.findOne({_id : data._id}, function(err, suc){
                    callback(err, suc)
                })
            })
        }                    
    });
}


function getProfileByID(data, callback) {
    Profile.findOne({_id : data}, function (err, suc) {
        if(err) {
            callback(err, null);
        } else {
            callback(null, suc);
        }
    });
}
function getProfileByUserIDs(data, callback) {
    Profile.find({user_id : data}, function (err, suc) {
        if(err) {
            callback(err, null);
        } else {
            callback(null, suc);
        }
    });
}

function getProfileByEmailID(data, callback) {
    Profile.findOne({user_id : data}, function (err, suc) {
        if(err) {
            callback(err, null);
        } else {
            callback(null, suc);

        }
    });
}


function deleteProfileByID(data, callback) {
    Profile.remove({_id : data}, function (deleteErr, deleteSuccess) {
        if(deleteErr) {
            callback(deleteErr, null);
        } else {
            callback(null, deleteSuccess);
        }
    });
}



function updatePhotoURL(photos, _id, callback) {
    Profile.update({_id:_id}, {photos:photos}, function (err, Success) {
        if(err) {
            callback(err, null);
        }
        else {
            callback(null, Success);
        }
    });
}

exports.getAllProfiles = getAllProfiles;
exports.addProfile = addProfile;
exports.updateProfile = updateProfile;
exports.getProfileByID = getProfileByID;
exports.getProfileByUserIDs = getProfileByUserIDs;
exports.getProfileByEmailID = getProfileByEmailID;
exports.deleteProfileByID = deleteProfileByID;
exports.updateProfile = updateProfile;
exports.updatePhotoURL = updatePhotoURL;

