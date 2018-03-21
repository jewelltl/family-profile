"use strict";

var profileDAO = require("../core/dao/profile-dao"),
    consts = require("../libs/consts"),

    clientPageRouter = require("./pages/client"),
    clientAPIRouter = require("./apis/client"),

    adminPageRouter = require("./pages/admin"),
    adminUserPageRouter = require("./pages/admin/user"),

    adminLoginAPIRouter = require("./apis/admin/loginApi"),
    adminTbUserApiRouter = require("./apis/admin/tbuserApi"),
    fs = require('fs-extra'),
    config = require("../config"),
    crypto = require('crypto'),
    mime = require('mime'),
    multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
        fs.exists(consts.PHOTO_URL.TEMP, function(exists){
            if(!exists){
                fs.mkdirp(consts.PHOTO_URL.TEMP)
            }
       })
	    cb(null, consts.PHOTO_URL.TEMP)
	},
	filename: function (req, file, cb) {
	    crypto.pseudoRandomBytes(16, function (err, raw) {
	      cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
	    });
	  }
	})

function register(app) {
   
      
   app.use(multer({storage: storage}).any());

    // client page
    app.use("/", clientPageRouter);
    // client api router
    app.use("/" + config.get("api:version") + "/api", clientAPIRouter);


    // admin page
    app.use("/admin", adminPageRouter);
    app.use("/admin/user", adminUserPageRouter);
    // admin api router
    app.use("/" + config.get("api:version") + "/api/admin", adminLoginAPIRouter);
    app.use("/" + config.get("api:version") + "/api/admin/user", adminTbUserApiRouter);

}

exports.register = register;
