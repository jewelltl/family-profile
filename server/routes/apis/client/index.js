"use strict";

var express = require("express"),
    router = express.Router(),
    config = require("../../../config"),
    utils = require("../../../libs/utils"),
    profileDAO = require("../../../core/dao/profile-dao"),
    tbUsersDAO = require("../../../core/dao/tbuser-dao"),
   	fs = require('fs-extra'),
    async = require('async'),
    PptxGenJS = require('pptxgenjs'),
    consts = require("../../../libs/consts");
    var path           = require('path');
    var uploadsDir   = path.resolve(__dirname, '../../../../public/uploads/');
    var imagesDir   = path.resolve(__dirname, '../../../../public/images/');


router.post("/login", function (req, res, next) {
  tbUsersDAO.authenticate(req.body, function (err, suc) {
    if(suc){
      req.session.user = {
        loginuser: suc
      }
      req.session.save();
      return utils.successResponse(suc, res, next);
    }else{
      return utils.successResponse("error", res, next);
    }
  })
});

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

function remove(array, element) {
    return array.filter(e => e !== element);
}

router.post("/user_confirm", function(req, res, next){
  
  profileDAO.getProfileByEmail(req.body.email, function(err, suc){
    if(suc.length > 0){
      res.redirect('/profile?user=' + suc[0]._id)
    }else{
      profileDAO.addProfileWithEmail(req.body.email, function(addErr, addSuc){
        if(addSuc){
          res.redirect('/profile?user=' + addSuc.ops[0]._id)
        }else{
          return utils.failedResponse(err, res, next);
        }
      })
    }
  })
})


router.post('/update_profile', function(req, res, next){
	req.body.photos = req.body.photos.split(",").clean("");
 
	profileDAO.updateProfile(req.body, req.session.user.loginuser._id, function(err, suc){
		if(err){
			return utils.failedResponse(err, res, next);
		}else{
     async.waterfall([
          function(callback_first) {
            saveProfile(suc, callback_first);
          },
          function(success_callback, callback_second) {
              buildPPT(suc, callback_second);
          }
      ], function (error, success) {
          if (error) { console.log('error') } else {

            console.log('Done!');
            return utils.successResponse(suc, res, next);     
          }
      });
		}
	})
})

router.post('/add_photo', function(req, res, next){
    return utils.successResponse(req.files[0].filename, res, next);
})

router.post('/remove_from_temp', function (req, res, next){
  
  fs.exists(consts.PHOTO_URL.TEMP + req.body.filename, function(exists) {
    if(exists){
      fs.unlinkSync(consts.PHOTO_URL.TEMP + req.body.filename)
    }
  });
  return utils.successResponse(req.body.filename, res, next);
});

router.post("/edit_remove_photo", function(req, res, next) {
  var profile_id = req.body.profile_id;
  var filename = req.body.filename;
  var current_photos = req.body.photos;
  var photos = current_photos.split(",");
  photos = remove(photos, filename);
  photos = photos.join(",");

  profileDAO.updatePhotoURL(photos, profile_id ,function(err, suc){
    
  })
  
  fs.exists(consts.PHOTO_URL.PROFILE + profile_id + "/" + filename, function(exists) {
    if(exists){
      fs.unlinkSync(consts.PHOTO_URL.PROFILE + profile_id + "/" + filename)
    }
  });

  return utils.successResponse(photos, res, next);
    
})

function buildPPT(user_data, callback){
  var pptx = new PptxGenJS();
      pptx.defineSlideMaster({
        title : 'MASTER_SLIDE',
        bkgd  : '000000',
      });
      var slide = pptx.addNewSlide('MASTER_SLIDE');
      slide.addText(
          [
              { text: user_data.name, options:{ fontSize:11, color:'ffffff', align:'l',isTextBox: true ,bold: true} }
          ],
          { x:0.1, y:0.1, w:3, h:0.7, fill:'000000', valign:'top'}
      );

      slide.addImage({ path: uploadsDir + "/profile/" +user_data._id+"/"+user_data.oldavatar, x:0.2, y:0.7, w:1.1, h:1.3 })
          .addImage({ path: uploadsDir + "/profile/" +user_data._id+"/"+user_data.currentavatar, x:1.5, y:0.7, w:1.1, h:1.3 })
      slide.addText(
          [
              { text: '1978', options:{ fontSize:11, color:'ffffff', align:'c',isTextBox: true ,bold: true} }
          ],
          { x:0.4, y:2.1, w:0.8, h:0.3, fill:'000000', valign:'top'}
      );
      slide.addText(
          [
              { text: '2018', options:{ fontSize:11, color:'ffffff', align:'c',isTextBox: true ,bold: true} }
          ],
          { x:1.7, y:2.1, w:0.8, h:0.3, fill:'000000', valign:'top'}
      );
      slide.addText(
          [
              { text:'Favorite IITK Memories:', options:{ fontSize:10, color:'ffffff', align:'l', breakLine:true ,bold: true} },
              { text: user_data.memory, options:{ fontSize:10, color:'ffffff', align:'l',isTextBox: true } }
          ],
          { x:0.1, y:2.3, w:3, h:1.3, fill:'000000' , valign:'top'}
      );

      slide.addText(
          [
              { text:'Changes since IITK:', options:{ fontSize:10, color:'ffffff', align:'l', breakLine:true , bold: true} },
              { text: user_data.changes, options:{ fontSize:10, color:'ffffff', align:'l' } }
          ],
          { x:0.1, y:3.6, w:3, h:1.3, fill:'000000', valign:'top' }
      );

      slide.addText(
          [
              { text:'Professional Bio:', options:{ fontSize:10, color:'ffffff', align:'lt', breakLine:true , bold: true} },
              { text: user_data.profession, options:{ fontSize:10, color:'ffffff', align:'l' } }
          ],
          { x:3, y:0.1, w:2.5, h:2, fill:'000000' , valign:'top'}
      );
      slide.addText(
          [
              { text:'Some of my Favorite:', options:{ fontSize:10, color:'ffffff', align:'l', breakLine:true , bold: true} },
              { text: user_data.favorite, options:{ fontSize:10, color:'ffffff', align:'l' } }
          ],
          { x:5.5, y:0.1, w:4, h:2, fill:'000000', valign:'top' }
      );

      slide.addText(
          [
              { text:'Musing/Reflection:', options:{ fontSize:10, color:'ffffff', align:'l', breakLine:true , bold: true} },
              { text: user_data.reflection, options:{ fontSize:10, color:'ffffff', align:'l' } }
          ],
          { x:0.1, y:4.9, w: 9, h:0.6, fill:'000000' , valign:'top'}
      );
      slide.addImage({ path: imagesDir + "/logo-small.gif" , x:9.4, y:4.8, w:0.5, h:0.5 })
      
      if(user_data.photos != ''){
          var photos = user_data.photos.split(",")
          var rel_pos_x = 3.1
          var rel_pos_y = 2
          var photo_num = 1
          photos.forEach(function(photo){
            slide.addImage({ path: uploadsDir + "/profile/" +user_data._id+"/"+photo, x: rel_pos_x, y: rel_pos_y, w:3, h:2 })
            photo_num++;
            if(photo_num % 2 == 0){
              rel_pos_x +=3
            }else{
              rel_pos_y +=1
            }
            if(photo_num % 3 == 0){
              rel_pos_x -=2
            }
          })
      }

      if(fs.existsSync(consts.PPTX_URL)){
          pptx.save(consts.PPTX_URL + user_data._id, function(filename){
              callback(null, filename);
          });
      }else{
          fs.mkdirp(consts.PPTX_URL).then(function(){
                pptx.save(consts.PPTX_URL + user_data._id, function(filename){
                  console.log('mkdir + filename =' + filename)
                  callback(null, filename);
              });          
          })    
      }
        
}
function saveProfile(suc, callback){
  fs.mkdirp(consts.PHOTO_URL.PROFILE + suc._id).then(function(){
      fs.exists(uploadsDir + "/temp/" + suc.oldavatar, function(exists){
        if(exists){
          fs.move(uploadsDir + "/temp/" + suc.oldavatar, consts.PHOTO_URL.PROFILE + suc._id + '/' + suc.oldavatar )    
        }
        
      })
      fs.exists(consts.PHOTO_URL.TEMP + suc.currentavatar, function(exists){
        if(exists){
          fs.move(uploadsDir + "/temp/" + suc.currentavatar, consts.PHOTO_URL.PROFILE  + suc._id + '/' + suc.currentavatar)  
        }
        
      })

      if(suc.photos != ""){
        suc.photos.split(",").forEach(function(photo) {
          fs.exists(uploadsDir + "/temp/" + photo, function(exists){
            if(exists){
              fs.move(uploadsDir + "/temp/" + photo, consts.PHOTO_URL.PROFILE + '/' + suc._id + '/' + photo );  
            }
          })
          
        });  
      }
    });
  callback(null, 'saved');
}


module.exports = router;