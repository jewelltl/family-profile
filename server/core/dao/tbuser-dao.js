"use strict";

var mongoose = require("mongoose"),
    User = mongoose.model("tb_user"),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    bcrypt = require("bcryptjs"),
    consts = require("../../libs/consts"),
    emailer = require("../../libs/emailer");

function getAllUsers(callback)
{
    User.find(null, null,{sort:{ 'username': 1 }}, function (err, success){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            callback(null, success);
        }
    });
}

function getUserByID(userid, callback)
{
    User.findOne({_id:userid}, function (err, success){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            callback(null, success);
        }
    })
}
function getUsersByIDs(userids, callback)
{
    User.find({_id:userids}, function (err, success){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            callback(null, success);
        }
    })
}

function addUser(user, callback)
{
    
    User.findOne({email: user.email}, function (err, findUser){
        if (findUser)
        {
            callback('existing', null);
        }
        else
        {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(user.email, salt, function (err, hash) {
                    user.password = hash;
                    User.collection.insert(user, function (err, success){
                        if (err)
                        {
                            callback(err, null);
                        }
                        else
                        {
                            callback(null, success);

                            // emailer.sendInvitationEmail(success.ops[0], function (emailErr, result) {
                            //     if (err) {
                            //         console.log(err);
                            //     }
                            //     else {
                            //         console.log(result);
                            //     }
                            // });
                        }
                    });
                });
            });
        }
    })
}

function deleteUserById(userid, callback)
{
    User.remove({_id:userid}, function (err, success){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            callback(null, success);
        }
    });
}

function updateUserByID(userid, user, callback)
{
    var user_password = user.email
    if (user.password != '')
    {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user_password, salt, function (err, hash) {
                user.password = hash;
                User.update({_id:userid}, user, function (err, success){
                    if (err)
                    {
                        callback(err, null);
                    }
                    else
                    {
                        callback(null, success);
                    }
                });
            });
        });
    }
    else
    {
        User.update({_id:userid}, {$set:{username:user.username, email:user.email}}, function (err, success){
            if (err)
            {
                callback(err, null);
            }
            else
            {
                callback(null, success);
            }
        });
    }
}

function setActive(id, callback){
    User.update({_id: id}, {active: 1},function(err, suc){
        callback(err, suc)
    })
}

function authenticate(data, callback){
    User.findOne({email: data.password}, function (err, findUser){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            if(findUser){
                bcrypt.compare(data.password, findUser.password, function(err, res) {
                    if (res == true)
                    {
                        callback(null, findUser);
                    }
                    else
                    {
                        callback({err:'incorrect password'}, null);
                    }
                });    
            }else{
                callback(err, null)
            }
            
        }
    });
}

function getClientUserByIDs(usersids, callback)
{
    User.find({_id: {$in: usersids}}, function (err, success){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            callback(null, success);
        }
    });
}

function validationSession(data, callback){

    User.findOne({username: data.username}, function (err, findUser){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            if (findUser) {
                if(data.password != findUser.password) {
                    callback(err, null);
                } else {
                    callback(null, findUser);
                }
            } else {
                callback(err, null);
            }
        }
    });
}

function updatePassword(id, password, callback)
{
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (!err)
            {
                password = hash;
                User.update({_id: id}, {$set:{password: password}}, function (err, updateSuccess){
                    if (err)
                    {
                        callback(err, null);
                    }
                    else
                    {
                        callback(null, updateSuccess);
                    }
                });
            }
        });
    });
}

exports.getAllUsers = getAllUsers;
exports.getUserByID = getUserByID;
exports.getUsersByIDs = getUsersByIDs;
exports.addUser = addUser;
exports.deleteUserById = deleteUserById;
exports.updateUserByID = updateUserByID;
exports.authenticate = authenticate;
exports.getClientUserByIDs = getClientUserByIDs;
exports.validationSession = validationSession;
exports.updatePassword = updatePassword;