angular.module('cargoNgApp')

 .controller('InstancesController', function($scope, $route, $routeParams, $location, $http) {

 	$scope.instances = [];

 	$http.get('/api/instances')
 		.then(function(response){
 			$scope.instances = response.data;
 		});

  $scope.impersonate = function(username){
    $http.post('/api/impersonate', {username: username})
    .then(function(res){
      if(res.data.status =='ok'){
        window.location = "/"
      }else{
        alert('error impersonating')
      }
    })
    .catch(function(){
      alert('error impersonating')
    })
  }

 })
