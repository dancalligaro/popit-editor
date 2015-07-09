var Q = require('q');
var fs = require('fs');
var mongoose = require('mongoose');
var ssh2 = require('ssh2');
var zlib = require('zlib');
var db = require('../db')

var CargoInstance = db.CargoInstance;

module.exports = {};

module.exports.uploadLocData = function(instanceName, locData) {

  var deferred = Q.defer();
  var uploadPath = process.env.SSH_BASE_UPLOAD_PATH + "/" + instanceName + "_locdata.json";
  deferred.resolve(uploadGZippedFile(uploadPath, locData))
  return deferred.promise;

};


function uploadGZippedFile(path, content) {

  var deferred = Q.defer();
  var defSftp = Q.defer();
  var conn = new ssh2();

  var data = (typeof content == "string" ? content : JSON.stringify(content));

  defSftp.promise.then(function(sftp){

    zlib.gzip(data, function(error, gZippedData) {

      if (error) {
        console.log('- error gzipping file', path)
        deferred.notify('- error gzipping file', path)
      } else {

        console.log('uploading to ', path);

        var writeStream = sftp.createWriteStream(path);
        writeStream.write(gZippedData, function() {

          deferred.notify('upload complete ' + path)
          console.log("- file transferred " + path);
          deferred.resolve();
          sftp.end();

        });

      }
    });

  });


  conn.on(
    'ready',
    function() {
      console.log("- ready");
      conn.sftp(
        function(err, sftp) {
          defSftp.resolve(sftp);
        }
      )
    }
  );

  conn.on(
    'connect',
    function() {
      console.log("- connected");
      deferred.notify('SSH connected')
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

}
