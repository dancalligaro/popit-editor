var express = require('express');
var popitService = require('./service/popit.js')
var usersService = require('./service/users.js')
var db = require('./db')
var request = require('request');
var crypto = require('crypto');
var ObjectId = require('mongoose').Types.ObjectId; 
var fileUploader = require('./service/fileUploader.js');

module.exports = {};

module.exports.create = function(req, res){

  var instanceName = req.body.instanceName;
  var popitUrl = req.body.popitInstance;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var passwordRepeat = req.body.passwordRepeat;

  //Validations

  if(username.length < 4){
  
  	res.send({
  		status: 'error', 
  		message: 'Username too short (min 4 chars)'
  	});
  
  } else if( password != passwordRepeat ){

  	res.send({
  		status: 'error', 
  		message: "Passwords don't match"
  	});

  } else if ( password.length < 6 ) {

  	res.send({
  		status: 'error', 
  		message: "Password too short (min 6 chars)"
  	});

  } else {

  	//TODO also check that usernames are unique
	db.CargoInstance.findOne({ instanceName : instanceName }, function(err, cargoInstance){
		
		if(err){
			console.log('create validation error querying for existing instances', err);		
			res.send({status: 'error', message:'Error getting instances'})
		}else{

			if(cargoInstance){
				res.send({status: 'error', message:'Instance already created'})
			}else{
				//
				//Query code to popit:

				var url = "http://" + popitUrl + ".popit.mysociety.org/api/v0.1";
				console.log("querying url", url)
				request(url, function (err, response, body) {
				  
				  if(err){
				  	console.log("error validating popit instance", err)
				  	res.send({status: "error", message: "Error validating popit instance"})
				  }else{
				  	if(response.statusCode == 200){

				  		var ci = new db.CargoInstance({
				  			instanceName: instanceName, 
				  			username: username,
				  			email: email, 
				  			popitUrl: popitUrl, 
				  			password: crypto.createHash('sha1').update( password ).digest('hex'), 
				  			emailHash: crypto.createHash('md5').update( email ).digest('hex')
				  		});

				  		ci.save(function(err){
				  			if(err){
				  				console.log('Error saving new instance', err);
				  				res.send({status: 'error', message: "Error creating instance"})
				  			}else{
				  				res.send({status: "ok", message: "Instance created"});
				  			}
				  		})

				  	}else{
				  		res.send({status: "error", message: "Popit instance not found"})
				  	}
				  }


				})

			}
		}
	});

  }




 //  popitService.createAndUploadIntance(instanceName, popitUrl)
 //  	.then(function(instance){
	// 	res.send({
	// 		status: 'ok', 
	// 		message: 'enqueued ' + req.body.name
	// 	});
	// }).catch(function(error){
	// 	res.send({
	// 		status: 'error', 
	// 		message: 'error creating instance' + req.body.name + "\n" + error
	// 	});
	// });


}

module.exports.updateMyInstance = function(req, res){

  var instanceName = req.session.user.instanceName;
  var popitUrl = req.session.user.popitUrl;

  popitService.updateInstance(instanceName)
  	.then(function(instance){
		res.send({
			status: 'ok', 
			message: 'enqueued ' + instanceName
		});
	}).catch(function(error){
		res.send({
			status: 'error', 
			message: 'error creating instance' + instanceName + "\n" + error
		});
	});

};

module.exports.myCurrentBuildStatus = function(req, res){
	
	var instanceName = req.session.user.instanceName;

	popitService.getInstanceProgress(instanceName).then(function(info){

		if(info){
			res.send({
				status: 'ok', 
				importStatus: info.status,
				log: info.log
			});			
		}else{
			res.send({
				status: 'error', 
				message: 'no data for instance'
			});
		}

	});

}

module.exports.currentBuildStatus = function(req, res){
	// /api/currentbuildstatus/:instancename
	var instanceName = req.params.instancename;

	popitService.getInstanceProgress(instanceName).then(function(info){

		if(info){
			res.send({
				status: 'ok', 
				importStatus: info.status,
				log: info.log
			});			
		}else{
			res.send({
				status: 'error', 
				message: 'no data for instance'
			});
		}

	});

};

module.exports.instances = function(req,res){

	db.CargoInstance.find(function(err, data){
		res.send(data);
	})

};


module.exports.login = function(req, res){
	if(req.session.user){
		res.redirect('/')
	}else{ 
		res.render('login', {});
	}
};

module.exports.loginPost = function(req, res){

	usersService.validateUser(req.body.username, req.body.password)
	.then(function(user){
		console.log('here');
		req.session.user = user;
		res.redirect('/')
	})
	.catch(function(){
		res.render('login', {
			error: 'Wrong username or password'
		})
	});

};

module.exports.impersonate = function(req, res){

	usersService.getUserForImpersonation(req.body.username)
	.then(function(user){
		req.session.user = user;
		res.send({status: 'ok'})
	})
	.catch(function(err){
		res.send({status: 'error', message: 'error impersonating'})
		console.log(err)
	});
	
}

module.exports.password = function(req, res){

	var user = req.session.user;
	var password = req.body.password;

	usersService.updatePassword(user, password)
	.then(function(){
		res.send({status: 'ok'})
	})
	.catch(function(err){
		res.send({status: 'error', message: err})
	})

}

module.exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/login');
};

module.exports.home = function(req, res){
	res.render('index', {
		user: req.session.user, 
		bootstrapData: JSON.stringify({
			user: req.session.user, 
			cargoBaseUrl: process.env.CARGO_BASE_URL
		})
	});
};

module.exports.myinfo = function(req, res){

	var returnedProperties = 'instanceName popitUrl email';

	db.CargoInstance.find(
		{
			_id: new ObjectId(req.session.user._id)
		}, 
		returnedProperties, 
		function(err, data){
			res.send(data);
		}
	);

}

module.exports.customization = function(req, res){

	var returnedProperties = 'customization';

	db.CargoInstance.find(
		{
			_id: new ObjectId(req.session.user._id)
		}, 
		returnedProperties, 
		function(err, data){
			res.send(data[0].customization ? data[0].customization : {});
		}
	);

}

module.exports.customizationPOST = function(req, res){

	var customization = req.body.customization;

	console.log(customization)

	db.CargoInstance.findOneAndUpdate(
		{
			_id: new ObjectId(req.session.user._id)
		}, 
		{
			customization: customization
		}, 
		function(err, data){
			if(err){
				res.send('500', {status: 'error', message: "error saving"})
			}else{

				//Upload File
				fileUploader.uploadLocData(req.session.user.instanceName, customization)
				.then(function(){
					res.send({status: 'ok'})	
				})
				.catch(function(){
					res.send('500', {status: 'error', message: "error uploading"})
				})

				
			}
		}
	);

}

module.exports.getPersons = function(req, res){

	request('') //REquest to popti

}

module.exports.proxyPUT = function(req, res){
	var collection = req.params.collection
	var id = req.params.id
	var url = "https://cargografias.popit.mysociety.org/api/v0.1/" + collection + "/" + id;

	// NODE_DEBUG=request

	var options = {
	  url: url,
	  method: 'PUT',
	  body: req.body,
	  json: true,
	  headers: {
	    'Apikey': process.env.POPIT_KEY
	  }
	}

	console.log('object to put', options)

	request.debug = true
	request(options, function(err,httpResponse,body){
		if(err){
			console.log(err)
			res.send('err');
		}else{
			console.log(body);
			res.send('ok')
		}
	})


}