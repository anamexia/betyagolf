function initializeLoginSync() {
  Parse.initialize(config.parseJsKey, config.parseMKey);
  if(!(typeof device === "object")){
    //console.log("init Face");
    window.fbAsyncInit = function() {
      //console.log("Running?");
      Parse.FacebookUtils.init({
      appId      : config.facebook, 
      version    : 'v2.5',
      xfbml:true, // parse XFBML
      });
    };

    (function(d, s, id){
      //console.log(d,s,id);
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }
}

function checkSignUp(){
  vex.dialog.open({
      message: 'Proporcione un Email, Username y Password:',
      input: '' +
          '<input name="email" type="email" placeholder="Email" required />' +
          '<input name="username" type="text" placeholder="Username" required />' +
          '<input name="password" type="password" placeholder="Password" required />' +
      '',
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Login' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Back' })
      ],
      callback: function (data) {
          if (data)
            betyaSignUp(data);
      }
  });
}

function loginFacebook() {
  if (typeof device === "object") {
    //alert("Native Login");
    facebookConnectPlugin.login(["public_profile", "email"], function(success){

      //alert("Success! "+success);
      console.log(success);

      //Need to convert expiresIn format from FB to date
      var expiration_date = new Date();
      expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
      expiration_date = expiration_date.toISOString();

      var facebookAuthData = {
        "id": success.authResponse.userID,
        "access_token": success.authResponse.accessToken,
        "expiration_date": expiration_date
      };

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(user) {
          console.log(user);
          if (!user.existed()) {
            alert("User signed up and logged in through Facebook!");
            facebookConnectPlugin.api("me/?fields=id,name",["public_profile"], function(response){
              user.set("username", response.name); 
              user.save().then(function() {
                alertify.success("Bienvenido "+ user.getUsername(),"", 800);
                fillBetyaUser();
                checkTemporal();
              }, nullHandler);
            }, function(data){
                alert("Error using Api");
            });
          } else {
            alert("User logged in through Facebook!");
            alertify.success("Bienvenido "+ user.getUsername(),"", 800);
            fillBetyaUser();
            checkTemporal();
          }
        },
        error: function(user, error) {
          alert("User cancelled the Facebook login or did not fully authorize.");
        }
      });

    }, function(error){
      alert("Error: "+error);
      console.log(error);
    });

  } else{
    //alert("Browser Login");
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        console.log(user);
        if (!user.existed()) {
          alert("User signed up and logged in through Facebook!");
          alertify.success("Bienvenido "+ user.getUsername(),"", 800);
          fillBetyaUser();
          checkTemporal();
        } else {
          alert("User logged in through Facebook!");
          alertify.success("Bienvenido "+ user.getUsername(),"", 800);
          fillBetyaUser();
          checkTemporal();
        }
      },
      error: function(user, error) {
        alert("User cancelled the Facebook login or did not fully authorize.");
      }
    });
  }
}

function betyaTestSignup(data) {
  console.log(data.email, data.username, data.password)
}

function betyaSignUp(data) {
  $('.mainLoader').removeClass('hidden'),
  $('body').spin('ball');
	//Create a new user on Parse
  var user = new Parse.User();
  user.set("username", data.username );
  user.set("password", data.password );
  user.set("email", data.email );
 
  // other fields can be set just like with Parse.Object
  /*user.set("library", {
  	1: "Fabio",
  	2: "Tostacho",
  	3: "Jaime"
  });*/
 
  user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now.
      //alert("success!");
      $('.mainLoader').addClass('hidden');
      $('body').spin(false);
      alertify.success("Bienvenido "+ user.getUsername(),"", 800);
      fillBetyaUser();
      checkTemporal();
    },
    error: function(user, error) {
      $('.mainLoader').addClass('hidden');
      $('body').spin(false);
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + "\n" + error.message);
    }
  });
}

function betyaLogin() {
  $('.mainLoader').removeClass('hidden'),
  $('body').spin('ball'),
	Parse.User.logIn( $("#parseUserName").val() , $("#parsePassWord").val() , {
    success: function(user) {
      // Do stuff after successful login.
      console.log(user.getUsername());
      //alert("success!");
      alertify.success("Bienvenido "+ user.getUsername(),"", 800);
      fillBetyaUser();
      checkTemporal();
      $('.mainLoader').addClass('hidden');
      $('body').spin(false);
    },
    error: function(user, error) {
      // The login failed. Check error to see why.
      console.log(error);
      $('.mainLoader').addClass('hidden');
      $('body').spin(false);
      alert("error!");
    }
  });	
}

function fillBetyaUser() {
  var current = Parse.User.current().getUsername();
  $("#loggedUserInfo").find('span').html(current);
  $("#loggedUserInfo").removeClass('hidden');
}

function betyaLogout() {
  vex.dialog.confirm({
    message: '¿Estas seguro que deseas cerrar sesion?',
    buttons: [
      $.extend({}, vex.dialog.buttons.YES, {
        text: 'Si'
      }), $.extend({}, vex.dialog.buttons.NO, {
        text: 'Cancelar'
      })
    ],
    callback: function(value) {
      if (value) verifyLogOut();
    }
  });
}

function verifyLogOut() {
  console.log(typeof facebookConnectPlugin);
  if (!(typeof facebookConnectPlugin == "undefined")) {
    facebookConnectPlugin.getLoginStatus(function(response) {
        if (response.status === 'connected' || response.status === 'not_authorized') {
          facebookConnectPlugin.logout(function(success) {
            //alert("LogOut Facebook");
          }, function() {
            alert("Error checking status");
          });
        }
        $('#loggedUserInfo').addClass('hidden');
        Parse.User.logOut();
        borrarJuegoActivo(true); 
      }, function() {
        alert("Error checking status");
    });
  } else{
    $('#loggedUserInfo').addClass('hidden');
        Parse.User.logOut();
        borrarJuegoActivo(true); 
  };
  
}

function betyaCheck() {
	var currentUser = Parse.User.current();

	if (currentUser) {
      //Sacar session de usuario para sacar su ultimo login
  console.log(currentUser.get('email'),currentUser.get('username'), currentUser.get('authData'), currentUser.get('email'), currentUser.get('createdAt'));

  /*var session = Parse.Object.extend("Session");
  var query = new Parse.Query(session);
  //query.include("email");
  //query.equalTo("username", currentUser.getUsername());
  query.first({
    success: function (e) {
      console.log(e, e.get('updatedAt'), e.get('createdAt'));
    }
  });*/

	    console.log("Hay User!", currentUser.getUsername());
      alertify.success("Bienvenido "+ currentUser.getUsername(),"", 800);
      fillBetyaUser();
      return true;
	} else {
	   	console.log("No User!");
      return false;
	}
}

function checkSubmit() {
  $("#loginForm").on("keypress", "input", function(e) {
    //check for enter key 
    //alert(e.which);
    if(e.which === 13) {
        //check for empty input
        //alert('Check Login!');
        var total = $("#parseUserName").val().length + $("#parsePassWord").val().length;
        if(total > 0) {
           betyaLogin();
        }
        else{
          alert('Invalido');
        }
    }
});
}