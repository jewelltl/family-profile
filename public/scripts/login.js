$(document).ready(function(){
	

	$(".login_btn").click(function(){
		var id = $(this).data("id");
		$("#password").val('')
		$("#username").html($(this).data('username'))
		$("#id").val(id)
	})

	$(".login-submit").click(function(){
		submit_function()
	})

	$('#password').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
		{
			submit_function()
			return false;  
		}
	});
	var submit_function = function(){
		if($("#password").val() == ''){
			$("#password").focus()
			return
		}else{
			$.post("/v1/api/login", {_id: $("#id").val(), password: $("#password").val()}, function(response){
				if(response.message != "error"){
					location.href = "/profile"
				}else{
					$("#login-modal").find('.alert').slideDown('500').delay('2000').slideUp('500')
				}
			})
		}
	} 
})