var crypto = require('crypto');
var Q = require('q');
var db = require('../db')

//These are the properties that will be available in session for the user.
//This will be sent to mongo to filter the returned parameters
//In addition, the _id will also be present
var sessionUserProperties = 'username email emailHash isAdmin instanceName popitUrl'; 

module.exports.validateUser = function (username, password) {

	var deferred = Q.defer();

	if(username =='admin' && password =='admin'){
		deferred.resolve({});
	}else{
		deferred.reject();
	}

	// db.CargoInstance.findOne(
	// 	{ 
	// 		username: username, 
	// 		password: crypto.createHash('sha1').update(password).digest('hex')
	// 	}, 
	// 	sessionUserProperties, 
	// 	function(err, cargoInstance){
		
	// 		if(err){
	// 			console.log('login error querying for existing instances', err);		
	// 			deferred.reject("Log In error");
	// 		}else{
	// 			if(cargoInstance){
	// 				var user = cargoInstance.toObject();
	// 				deferred.resolve(user);
	// 			}else{
	// 				deferred.reject("Invalid username or password");
	// 			}
	// 		}
	// 	}
	// );

	return deferred.promise;

}

module.exports.getUserForImpersonation = function(username){

	var deferred = Q.defer();

	db.CargoInstance.findOne(
		{ 
			username : username 
		},
		sessionUserProperties,
		function(err, cargoInstance){
		
		if(err){
			console.log('login error querying for existing instances', err);		
			deferred.reject("Log In error");
		}else{

			if(cargoInstance){
				var user = cargoInstance.toObject();
				deferred.resolve(user);
			}else{
				deferred.reject("Invalid username");
			}
		}
	});

	return deferred.promise;

}

module.exports.updatePassword = function(user, password){

	var deferred = Q.defer();

	if(password.length < 6){

		deferred.reject("Error - password is too short");

	}else{

		db.CargoInstance.findOne({ username : user.username }, function(err, cargoInstance){
			
			if(err){
				console.log('error querying for existing instances', err);		
				deferred.reject("Error retrieving user");
			}else{

				if(cargoInstance){
					
					cargoInstance.password = crypto.createHash('sha1').update( password ).digest('hex');
					
					cargoInstance.save(function(err){
		  			
		  			if(err){
		  				console.log('Error updating password', err);
		  				deferred.reject("Error updating password")
		  			}else{
		  				deferred.resolve();
		  			}

		  		})

				}else{
					deferred.reject("User not found");
				}
			}
		});

	}

	return deferred.promise;

}

