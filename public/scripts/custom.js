$(document).ready(function(){
	
	$("#testselect").change(function(){
		console.log(typeof $(this).val())
		console.log($(this).val())
	})


	function showAlert(description, status){
		var img;
		var title;
		    
        
		if(status == "success") {
			img = '/images/success.png';
			title = "Success!";
		}else if(status == "error") {
			img = '/images/error.png';
			title = "Failed!";
		}else if(status == 'warning'){
			img = 'images/warn.png';
			title = "Warning!";
		}
		var unique_id = $.gritter.add({
            title: title,
            text: description,
            image: img,
            sticky: true,
            time: '',
            class_name: 'gritter-light'
        });

        setTimeout(function () {
            $.gritter.remove(unique_id, {
                fade: true,
                speed: 'slow'
            });
        }, 2000);
	}

	var advertiseid;

	var tempoldavatar;
	var tempcurrentavatar;

	$('#oldavatar').change(function (){
		
		var filename = $("#oldavatar_id").val()
		var oldavatar_img = "";
		
		var xhr = new XMLHttpRequest();
		var url = $(this).parents('form').attr('action');
		var method = $(this).parents('form').attr('method');
		xhr.open(method, url, true);

		var formdata = new FormData();
		var file = $(this).find('input').context.files[0];

		if (typeof(file) == "undefined"){
			removeImageFromTemp(filename)
		}else{
			if(filename != ''){
				removeImageFromTemp(filename)	
			}
			formdata.append("files", file, file.name);
			
			xhr.send(formdata);

			var element = $(this);

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {

					oldavatar_img = JSON.parse(xhr.responseText).message;
					
					element.parents('div').find('#oldavatar_id').val(oldavatar_img);
				}
			}	
		}
		
	});

	$('#currentavatar').change(function (){
		
		var currentavatar_img = "";
		
		var filename = $("#currentavatar_id").val()
		var xhr = new XMLHttpRequest();
		var url = $(this).parents('form').attr('action');
		var method = $(this).parents('form').attr('method');
		xhr.open(method, url, true);

		var formdata = new FormData();
		var file = $(this).find('input').context.files[0];
		if(typeof(file) == "undefined"){
			removeImageFromTemp(filename)
		}else{
			if(filename != ''){
				removeImageFromTemp(filename)	
			}
			formdata.append("files", file, file.name);
			xhr.send(formdata);
			var element = $(this);

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					currentavatar_img = JSON.parse(xhr.responseText).message;
					element.parents('div').find('#currentavatar_id').val(currentavatar_img);
				}
			}	
		}
		
	});

	$(".editRemovePhoto").click(function(e) {
		e.preventDefault();
		$(this).parent().css({'display':'none'});

		var removeProfileId = $(this).data('profile_id');
		var removePhotoName = $(this).data('photoname');
		var photos = $("#photos").val();
		console.log(photos)
		
		uploadCount--;

		$.post("/v1/api/edit_remove_photo",
          {
          	  profile_id: removeProfileId,
              filename: removePhotoName,
              photos: photos,
          },
          function(data,status) {
              $("#photos").val(data.message)
        });
	})

	$("#save").click(function(){
		var profile_info = getPageData();
		var save_btn = $(this)
		save_btn.addClass('disabled').find('i').addClass('fa-spinner').removeClass('fa-save');
		$.ajax({
            type:'POST',
            url: '/v1/api/update_profile',
            data: profile_info,
            dataType:'json',
            async: false,
            success:function(response){
            	if(response.success == 1){
	                save_btn.removeClass('disabled').find('i').removeClass('fa-spinner').addClass('fa-save');
            	}
            	$("#publish").attr('saved', 1)
            	console.log($("#publish").attr('saved'))
            	showAlert('Successfully Saved', 'success')
            },
        });    
	})
	$("#publish").click(function(){
		
		if($(this).attr('saved') == 0){
			showAlert('Please Save your profile first', 'warning')
		}else{
			location.href="/publish"
		}
	})
	var getPageData = function(){
		var page_data = {}

		var _id = $("#id").val()
		var name = $("#name").val()
		var oldavatar = $("#oldavatar_id").val()
		var currentavatar = $("#currentavatar_id").val()
		var memory = $("#memory").val()
		var changes = $("#changes").val()
		var profession = $("#profession").val()
		var favorite = $("#favorite").val()
		var reflection = $("#reflection").val()
		var photos = $("#photos").val()
		page_data = {_id: _id, name: name, oldavatar: oldavatar, currentavatar: currentavatar, memory: memory, changes: changes, profession: profession, favorite: favorite, reflection: reflection, photos: photos}
		
		return page_data;	
	}

	var removeImageFromTemp = function(filename){
		$.post('/v1/api/remove_from_temp', {filename: filename}, function(response, status){
			console.log(response)
		})
	}
});