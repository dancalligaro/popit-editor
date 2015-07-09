angular.module('cargoNgApp')

 .controller('NewInstanceController', function($scope, $route, $routeParams, $location, $http) {

 	$scope.createInstance = function(){
 			
		$http.post('/api/create', {

			instanceName: $scope.instanceName,
			popitInstance: $scope.popitInstance,
			username: $scope.email,
			email: $scope.email,
			password: $scope.password, 
			passwordRepeat: $scope.password2

		}).then(function(res){

			if(res.data.status && res.data.status == 'ok'){
				alert('New instance created')
			}else{
				alert('Error creating instance')
				console.log('error', res.data)
			}

		}).catch(function(err){
			alert('error creating');
		}); 		


 	}

 })



// var cargoApp = angular.module('cargoApp', []);

// cargoApp.controller('MainCtrl', [

// 	'$scope', '$http', '$timeout',

// 	function ($scope, $http, $timeout){

// 		$scope.sendCreate = function(){

// 			$scope.responseLines = [];

// 			$http.post('/api/create', {
// 				name: $scope.cargoName, 
// 				popitInstance: $scope.popitInstance
// 			}).then(function(res){

// 				//Start watching:
// 				watchResponse($scope.cargoName);
				
// 			}).catch(function(err){
// 				alert('error creating');
// 			});

// 		};

// 		function watchResponse(instanceName){

// 			$http.get('/api/currentbuildstatus/' + instanceName).then(function(res){
				
// 				$scope.responseLines = res.data.log;
				
// 				if(res.data.importStatus === 'creating'){
// 					$timeout(function(){ watchResponse(instanceName); }, 1000);
// 				}
				
// 			});

// 		}


// }]);
