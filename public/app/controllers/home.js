angular.module('cargoNgApp')

 .controller('MainController', function($scope, $http, $timeout) {

  $http.get('/api/myinfo').then(function(response){
    $scope.myinfo = response.data[0];
  });

  $scope.progress = 0;

  $scope.updateInstance = function(){

    $scope.responseLines = [];
    $scope.progress = 0;

    $http.post('/api/updatemyinstance')
    .then(function(response){
      //Start watching:
      watchResponse($scope.cargoName);

    })
    .catch(function(){
      alert('Error updating instance')
    })
    ;     
  }


  function watchResponse(){

    $http.get('/api/mycurrentbuildstatus').then(function(res){
      
      var totalLines = 16;  
      $scope.responseLines = res.data.log;
      $scope.progress = ($scope.responseLines.length / 16) * 100;

      if(res.data.importStatus === 'creating'){
        $timeout(function(){ watchResponse(); }, 1000);
      }
      
    });

  }



 })



// var cargoApp = angular.module('cargoApp', []);

// cargoApp.controller('MainCtrl', [

//  '$scope', '$http', '$timeout',

//  function ($scope, $http, $timeout){

//    $scope.sendCreate = function(){

//      $scope.responseLines = [];

//      $http.post('/api/create', {
//        name: $scope.cargoName, 
//        popitInstance: $scope.popitInstance
//      }).then(function(res){

//        //Start watching:
//        watchResponse($scope.cargoName);
        
//      }).catch(function(err){
//        alert('error creating');
//      });

//    };

//    function watchResponse(instanceName){

//      $http.get('/api/currentbuildstatus/' + instanceName).then(function(res){
        
//        $scope.responseLines = res.data.log;
        
//        if(res.data.importStatus === 'creating'){
//          $timeout(function(){ watchResponse(instanceName); }, 1000);
//        }
        
//      });

//    }


// }]);
