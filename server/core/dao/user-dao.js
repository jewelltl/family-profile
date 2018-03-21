"use strict";

var mongoose = require("mongoose"),
    User = mongoose.model("user"),
    ClientUser = mongoose.model('tb_user'),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    bcrypt = require("bcryptjs"),
    consts = require("../../libs/consts");

function addUser(user,callback) 
{
    if(user.username){
        getUserByName(user.username, function (err, suc){
            if(err){
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        user.password = hash;
                        User.collection.insert(user, function (err, success){
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
            }else{
                callback("Aleady Exist!", null);
            }
        })
    }
    
    
};

function getUserById(userId, callback) {
    User.findById(userId)
        .exec(function (err, findUser) {
            if(err) {
                callback(err, null);
            } else {
                if(findUser) {
                    callback(null, findUser);
                } else {
                    var error = new Error(consts.USER_NOT_EXISTS);
                    error.status = 422;
                    callback(error, null);
                }
            }
        });
}

function getUserByName(username, callback) {
    if(username) {
        username = username.toLowerCase();
    }

    User.findOne({username : username}, function (err, findUser) {
        if(err) {
            callback(err, null);
        } else {
            if(findUser) {
                callback(null, findUser);
            }
            else{
                callback({err: "User is Empty"}, null);
            }
        }
    });
}

function authenticate(data, callback){
    getUserByName(data.username, function (err, findUser){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            if (findUser)
            {
                bcrypt.compare(data.password, findUser.password, function(err, res) {
                    if (res == true)
                    {
                        callback(null, findUser);
                    }
                    else
                    {
                        callback(err, null);
                    }
                });
            }
            else
            {
                callback({err:"no user"}, null);
            }
            
        }
    });
}

function getUserBySessionId(sessionId, callback) {
    var sessionsCollection = mongoose.connection.db.collection("sessions");

    async.waterfall([
        function(cb) {
            sessionsCollection.findOne({_id:sessionId}, cb);
        }, function(foundSession, cb) {
            if(!foundSession) {
                var incorrectSessionErr = new Error(consts.INCORRECT_SESSION);
                incorrectSessionErr.status = 403;
                cb(incorrectSessionErr, null);
            } else {
                var sessionField = JSON.parse(foundSession.session);
                var userId = sessionField.userId;
                cb(null, userId);
            }
        }, function(userId, cb) {
            getUserById(userId, cb);
        }
    ], function (err, user) {
        if(err) {
            callback(err);
        } else {
            callback(null, user);
        }
    });
}

function updatePassword(user, password, callback)
{
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (!err)
            {
                password = hash;
                User.update({username: user}, {password: password}, function (err, updateSuccess){
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

function getAllUsers(callback)
{
    User.find({$query: {username:{$ne: 'admin'}}, $orderby: {username: -1}},function (err, success){

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

function updateUserByID(user_id, user, callback)
{    
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            user.password = hash;
            User.update({_id: user_id}, user, function (err, success){
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

function updateUserByIDWithoutPassword(user_id, user, callback){
    User.update({_id: user_id}, user, function (err, success){
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

function deleteUser(user_id, callback)
{
    User.remove({_id: user_id}, function (err, success){
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

function getUserByID(user_id, callback)
{
    User.findOne({_id: user_id}, function (err, success){
        if (err)
        {
            callback(err, null);
        }
        else
        {
            console.log(success);
            callback(null, success);
        }
    });
}

exports.getUserByEmail = getUserByName;
exports.authenticate = authenticate;
exports.getUserBySessionId = getUserBySessionId;
exports.getUserByID = getUserByID;
exports.updatePassword = updatePassword;
exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.updateUserByID = updateUserByID;
exports.deleteUser = deleteUser;
exports.updateUserByIDWithoutPassword = updateUserByIDWithoutPassword;