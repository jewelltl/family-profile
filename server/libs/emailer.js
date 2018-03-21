"use strict";

var express = require("express"),
    expSession = require("express-session"),
    router = express.Router(),
    config = require("../config"),
    utils = require("../libs/utils"),
    consts = require("../libs/consts"),
    async = require("async"),
    fs = require("fs");

var mailer = require("nodemailer");
var path           = require('path');
var templatesDir   = path.resolve(__dirname, '../views/templates');

var EmailTemplate = require('email-templates').EmailTemplate;



var smtpOptions = {
    // host: 'smtp.ethereal.email',
    host: config.get('email:host'),
    port: 587,
    // auth: {
    //     user: 'eql7jteuo656rgjl@ethereal.email',
    //     pass: 'psVzZZMdREZmZPS8FU'
    // },
    auth: {
        user: config.get('email:user'),
        pass: config.get('email:pass')
    },
    secure: false,
    tls: {
        rejectUnauthorized: false,
    }
}

var transporter = mailer.createTransport(smtpOptions);
//******************************************************
// function send_mail
// 
// mailOptions = {
//  from        : "sender emailaddress",       
//  to          : "receiver emailaddress",
//  subject     : "email subject",
//  text        : "email text",
//  attachments : "attachments url",
//  Cc          : "Cc user emailaddress",
//  Bcc         : "Bcc user emailaddress",
// }
// content = "html tag content";
//*******************************************************

function send_mail(mailOptions, content, callbackParams, callback) {
    async.parallel([
        function (callback) {
            if (mailOptions.attachments) {
                fs.readFile(attachments, function(err, data){
                    if (err){
                        callback(err, null);
                    }
                    else {
                        var paths = attachments.split('/');
                        var filename = paths[paths.length - 1];
                        mailOptions.attachments = [{
                            filename: filename,
                            content: data
                        }];
                        callback(null, 'success');
                    }
                });
            }
            else {
                callback(null, 'success');
            }
        },
        function (callback) {
            if (!mailOptions.from) {
                mailOptions.from = config.get("email:username");
            }
            callback(null, 'success');
        }
    ]
    ,function (err, result) {
        console.log(smtpOptions)
        content.base_url = config.get("domain");
        content.site = config.get("site");

        var locals = {content: content};

        var templateDir = path.join(templatesDir, 'email');
        var emailTemplate = new EmailTemplate(templateDir);
        emailTemplate .render(locals , function (err, result) {
            if (err) {
               return console.error(err)
            }
            mailOptions.html = utils.htmldecode(result.html);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', mailer.getTestMessageUrl(info));
            });
        })
    });

}


function sendInvitationEmail(user_data, callback) {
    var mailOptions = {};
    // mailOptions.to = user_data.email;
    mailOptions.to = 'leetailoong@outlook.com';
    var content = {
        username: user_data.username,
        site_url: config.get('site:officialurl')
    }
    mailOptions.subject = "Complete our 78-83 family profile";
    mailOptions.text = "You have received invitation to update your family profile from IITK 78-83 Batch";

    mailOptions.Cc = "leetailoong@outlook.com";
    send_mail(mailOptions, content, 'success', function (err, result) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, result);
        }
    });
}

exports.sendInvitationEmail = sendInvitationEmail;

