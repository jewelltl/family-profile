var FormValidation = function () {

    // basic validation
    var  handleValidationofUserCreation= function() {
        // for more info visit the official plugin documentation: 
            // http://docs.jquery.com/Plugins/Validation

        var form = $('#user_create_form');
        var error = $('.alert-danger.form-error', form);
        var success = $('.alert-success', form);

        form.validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block help-block-error', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",  // validate all fields including form hidden input
            messages: {
                select_multi: {
                    maxlength: jQuery.validator.format("Max {0} items allowed for selection"),
                    minlength: jQuery.validator.format("At least {0} items must be selected")
                }
            },
            rules: {
                username: {
                    minlength: 2,
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
            },

            invalidHandler: function (event, validator) { //display error alert on form submit              
                success.hide();
                error.show();
                Metronic.scrollTo(error, -200);
            },

            highlight: function (element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            unhighlight: function (element) { // revert the change done by hightlight
                $(element)
                    .closest('.form-group').removeClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                label
                    .closest('.form-group').removeClass('has-error'); // set success class to the control group
            },

            submitHandler: function (form, event) {
                error.hide();
                event.preventDefault()
                $.post($(form).attr("action"),
                    {username: $(form).find("input[name=username]").val(), email: $(form).find("input[name=email]").val()},
                    function(response, status){
                        if(response.message == "existing"){
                            $(".validate-error").slideDown(500).delay(2000).slideUp(500)
                        }else{
                            location.href="/admin"
                        }
                })
            }
        });
    }

    var  handleValidationofUserUpdate= function() {
        // for more info visit the official plugin documentation: 
            // http://docs.jquery.com/Plugins/Validation

        var form = $('#user_update_form');
        var error = $('.alert-danger.form-error', form);
        var success = $('.alert-success', form);

        form.validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block help-block-error', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",  // validate all fields including form hidden input
            messages: {
                select_multi: {
                    maxlength: jQuery.validator.format("Max {0} items allowed for selection"),
                    minlength: jQuery.validator.format("At least {0} items must be selected")
                }
            },
            rules: {
                username: {
                    minlength: 2,
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
            },

            invalidHandler: function (event, validator) { //display error alert on form submit              
                success.hide();
                error.show();
                Metronic.scrollTo(error, -200);
            },

            highlight: function (element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            unhighlight: function (element) { // revert the change done by hightlight
                $(element)
                    .closest('.form-group').removeClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                label
                    .closest('.form-group').removeClass('has-error'); // set success class to the control group
            },

            submitHandler: function (form, event) {
                error.hide();
                form.submit()
                
            }
        });
    }

    return {
        //main function to initiate the module
        init: function () {
            handleValidationofUserCreation();
            handleValidationofUserUpdate();
        }

    };

}();

$(document).ready(function(){
    $("#publish").click(function(){
        var btn = $(this);
        btn.addClass('disabled')
        $(btn).find('span:first').addClass('display-hide')
        $(btn).find('span:last').removeClass('display-hide')
        console.log($("#users").val())
        $.post('/v1/api/admin/user/publish', {
            users: $("#users").val()
        }, function(response){
            if(response.success == 1){
                $(btn).find('span:first').removeClass('display-hide')
                $(btn).find('span:last').addClass('display-hide')
                btn.removeClass('disabled')
            }
            if(response.message == 'success'){
                bootbox.confirm("Are you sure to download the information of selceted users?", function(result) {
                    if(result){
                        location.href = "/admin/user/publish"
                    }
                });    
            }else{
                bootbox.alert("Failed in building ppt....", function() {
                    
                });
            }
        })
    })
    $(".del_btn").click(function(){
        var id = $(this).data('id')
        bootbox.confirm("Are you sure?", function(result) {
            if(result){
                location.href = "/admin/user/delete?id=" + id
            }
        });
    })
    $("#invite_form .invite_btn").click(function(){
        bootbox.confirm("Are you sure?", function(result) {
            if(result){
                $("#invite_form").submit()
            }
        });  
    })
})