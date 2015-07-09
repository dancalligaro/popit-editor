var Toolkit = require('popit-toolkit');
var Q = require('q');
var fs = require('fs');
var mongoose = require('mongoose');
var ssh2 = require('ssh2');
var zlib = require('zlib');
var db = require('../db')
var crypto = require('crypto');

var CargoInstance = db.CargoInstance;

var currentBuilds = {};
var buildQueue = [];
var currentProcessing = null;

function updateInstance(instanceName) {

  var deferred = Q.defer();

  CargoInstance.findOne({
    instanceName: instanceName
  }, function(err, cargoInstance) {
    if (err) {
      console.log('error querying for existing instances', err);
      deferred.reject(err);
    } else {

      if (cargoInstance) {
        addToBuildQueue(cargoInstance);
        deferred.resolve(cargoInstance);
      } else {

        var message = 'instance not found' + instanceName
        console.log(message)
        deferred.reject(message);
      }
    }
  });

  return deferred.promise;

}

function getInstanceProgress(instanceName) {
  var deferred = Q.defer();

  if (currentBuilds[instanceName]) {
    deferred.resolve({
      log: currentBuilds[instanceName].progressLog,
      status: currentBuilds[instanceName].status
    });
  } else {
    deferred.resolve();
  }

  return deferred.promise;
}

function getAllInstances() {
  var deferred = Q.defer();
  deferred.resolve(CargoInstance.find());
  return deferred.promise;
}

function getQueue() {
  return buildQueue;
}

function addToBuildQueue(cargoInstance) {

  if (currentBuilds[cargoInstance.instanceName] && currentBuilds[cargoInstance.instanceName].status != 'completed') {

    console.log('error instance already scheduled')

  } else {

    cargoInstance.status = "creating";
    currentBuilds[cargoInstance.instanceName] = cargoInstance;
    buildQueue.push(cargoInstance);
    processNext();

  }
}

function processNext() {

  if (!currentProcessing) {
    currentProcessing = buildQueue.shift();
    if (currentProcessing) {
      processInstance(currentProcessing)
        .then(function() {
          currentProcessing.status = 'completed';
        })
        .catch(function() {

        })
        .finally(function() {
          console.log('checking if there is a new one')
          currentProcessing = null;
          setTimeout(processNext, 100);
        });
    } else {
      console.log('nothing else to process')
    }
  }

}

function processInstance(instance) {

  console.log('processing instance', instance.instanceName)

  var deferred = Q.defer();
  var persons, organizations, posts, memberships;

  toolkit = Toolkit({
    host: instance.popitUrl + ".popit.mysociety.org"
  });

  instance.progressLog = [];
  instance.progressLog.push('Loading Persons...')

  toolkit.loadAllItems('persons').then(function(_persons) {
  
    //Add sha1 to person id    
    _persons.forEach(function(person){ 
      person.id_sha1 = crypto.createHash('sha1').update( person.id ).digest('hex');
    });

    console.log(_persons.length + ' persons loaded.')
    instance.progressLog.push(_persons.length + ' persons loaded.')
    instance.progressLog.push('Loading Organizations...')
    persons = _persons;
    return toolkit.loadAllItems('organizations');
  }).then(function(_organizations) {
    console.log(_organizations.length + ' organizations loaded.')
    instance.progressLog.push(_organizations.length + ' organizations loaded.')
    instance.progressLog.push('Loading Posts...')
    organizations = _organizations;
    return toolkit.loadAllItems('posts');
  }).then(function(_posts) {
    console.log(_posts.length + ' posts loaded.')
    instance.progressLog.push(_posts.length + ' posts loaded.')
    instance.progressLog.push('Loading Memberships...')
    posts = _posts;
    return toolkit.loadAllItems('memberships');
  }).then(function(_memberships) {
    console.log(_memberships.length + ' memberships loaded.')
    instance.progressLog.push(_memberships.length + ' memberships loaded.')
    memberships = _memberships;
    console.log('ready to upload');
    var upl = uploadFilesToServer(instance.instanceName, persons, organizations, posts, memberships)
    upl.progress(function(message) {
      instance.progressLog.push(message);
    });
    return upl;
  }).then(function() {
    instance.progressLog.push('All files uploaded');
    deferred.resolve();
  });

  return deferred.promise;

}

function uploadFilesToServer(instanceName, persons, organizations, posts, memberships) {

  var deferred = Q.defer();
  var conn = new ssh2();
  var files = [{
    name: 'persons.json',
    file: persons
  }, {
    name: 'organizations.json',
    file: organizations
  }, {
    name: 'posts.json',
    file: posts
  }, {
    name: 'memberships.json',
    file: memberships
  }];

  conn.on(
    'connect',
    function() {
      console.log("- connected");
      deferred.notify('SSH connected')
    }
  );

  conn.on(
    'ready',
    function() {
      console.log("- ready");

      conn.sftp(
        function(err, sftp) {

          if (err) {
            console.log("Error, problem starting SFTP: %s", err);
            deferred.reject("Error, problem starting SFTP: %s", err)
          } else {

            console.log("- SFTP started");
            deferred.notify("SFTP started");

            function uploadFile(file) {

              zlib.gzip(JSON.stringify(file.file), function(error, result) {

                if (error) {
                  console.log('- error gzipping file', file.name)
                  deferred.notify('- error gzipping file', file.name)
                } else {

                  var destinationPath = process.env.SSH_BASE_UPLOAD_PATH + "/" + instanceName + "-" + file.name
                  var writeStream = sftp.createWriteStream(destinationPath);

                  console.log('uploading file ', file.name)
                  console.log('uploading to ', destinationPath);

                  writeStream.write(result, function() {

                    deferred.notify('upload complete ' + file.name)
                    console.log("- file transferred " + file.name);

                    if (files.length > 0) {
                      setTimeout(function() {
                        uploadFile(files.shift());
                      }, 1)
                    } else {
                      console.log('resolving deferred uploding files')
                      deferred.notify('everything uploaded');
                      deferred.resolve();
                      sftp.end();
                    }

                  });

                }
              });

            }

            uploadFile(files.shift());

          }
        }
      );
    }
  );

  conn.on(
    'error',
    function(err) {
      console.log("- connection error: %s", err);
    }
  );

  conn.on(
    'end',
    function() {

    }
  );

  conn.connect({
    "host": process.env.SSH_HOST,
    "port": 22,
    "username": process.env.SSH_USER,
    "password": process.env.SSH_PASSWORD
  });

  return deferred.promise;
};


//Testing upload to server;

/*

  uploadFilesToServer('juanita', "['a', 'b']", "['a', 'b']", "['a', 'b']", "['a', 'b']").then(function(){
    console.log("=====================================");
    uploadFilesToServer('papapapa', "['a', 'b']", "['a', 'b']", "['a', 'b']", "['a', 'b']")
  })

*/


// // TEsting create a random intsance
// createAndUploadIntance("lalala" + (+ new Date()), "cargografias");

// // Testing enqueing
// setTimeout(function(){
//  createAndUploadIntance("lalala" + (+ new Date()), "cargografias");
// }, 500);

// setTimeout(function(){
//  createAndUploadIntance("lalala" + (+ new Date()), "cargografias");
// }, 1000);


//createAndUploadIntance("lalala" + (+ new Date()), "cargografias");




module.exports = {
  updateInstance: updateInstance,
  getAllInstances: getAllInstances,
  getInstanceProgress: getInstanceProgress
};
