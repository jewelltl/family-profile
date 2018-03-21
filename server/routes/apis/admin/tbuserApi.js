"use strict";

var express = require("express"),
    router = express.Router(),
    config = require("../../../config"),
    utils = require("../../../libs/utils"),
    tbuserDAO = require("../../../core/dao/tbuser-dao"),
    profileDAO = require("../../../core/dao/profile-dao"),
    fs = require('fs-extra'),
    checkAuth = require("../../../core/user/check-auth"),
    PptxGenJS = require('pptxgenjs'),
    consts = require("../../../libs/consts"),
    path = require('path'),
    uploadsDir   = path.resolve(__dirname, '../../../../public/uploads/'),
    imagesDir   = path.resolve(__dirname, '../../../../public/images/');

router.get('/', function(req, res, next) {

});

router.post("/update", function (req, res, next){

	checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            return next(findUserErr);
          
        } else {
            var userid = req.body._id;
			var user = req.body;
			tbuserDAO.updateUserByID(userid, user, function (err, success){
				if (success)
				{
					res.redirect("/admin")
				}
			});
        }
    });
	
});

router.post("/create", function (req, res, next){
	checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            return next(findUserErr);
        } else {
            var user = req.body;

			tbuserDAO.addUser(user, function (err, success){
				if (success)
				{
					return utils.successResponse(success, res, next);
				}else{
					return utils.successResponse(err, res, next);
				}
			});
        }
    });
});

router.post("/delete_user", function (req, res, next){

	checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            return next(findUserErr);
          
        } else {
            var userid = req.body.id;

			tbuserDAO.deleteUserById(userid, function (err, success){
				if (err)
				{
					
				}
				else
				{
					if (success == 1)
					{
						tbuserDAO.getAllUsers(function (err, success){
							if (success)
							{
								return utils.successResponse(success, res, next);
							}
						});
					}
				}
			});
        }
    });
	
});
router.post("/publish", function(req, res, next){
   checkAuth(req, res, next, function(findUserErr, currentUser) {
        if (findUserErr) {
            res.render("admin/login");
        } else {
        	var users = req.body.users.split(",").clean("")
            profileDAO.getProfileByUserIDs(users, function(err, suc){
                if(suc){
                	var pptx = new PptxGenJS();
			        	pptx.defineSlideMaster({
				    	title : 'MASTER_SLIDE',
						bkgd  : '000000',
				    });
	        		suc.forEach(function(user_data){
	        			build_slide(user_data, pptx)
	        		})
                    
                    if(fs.existsSync(consts.PPTX_URL)){
				          pptx.save(consts.PPTX_URL + 'admin_ppt', function(filename){
				              return utils.successResponse('success', res, next);
				          });
				      }else{
				          fs.mkdirp(consts.PPTX_URL).then(function(){
				                pptx.save(consts.PPTX_URL + 'admin_ppt', function(filename){
				                  return utils.successResponse('success', res, next);
				              });          
				          })    
				      }
                    
                }else{
                	return utils.successResponse('failed', res, next);
                }
                
            })
        }
    }); 
})


  
function build_slide(user_data, pptx){
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
	          rel_pos_x -=2.3
	        }
	      })
	  }
	  slide.addImage({ path: imagesDir + "/logo-small.gif" , x:9.4, y:4.8, w:0.5, h:0.5 })
	  
}
      

      
        


module.exports = router;