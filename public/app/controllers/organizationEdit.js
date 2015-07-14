angular.module('cargoNgApp')

 .controller('OrganizationEditController', function($scope, $modalInstance, $http, item) {

 	$scope.organization = {};

 	$scope.organization.name = item.name;
 	console.log('this is the received organization', item);

 	$scope.save = function(){

 		var organizationToSave = {
 			name: $scope.organization.name, 
 		}

 		var url = "/proxy/organizations/" + item.id;
 		
 		$http({
 			method: 'PUT',
 			url: url, 
 			data: organizationToSave, 
 		}).success(function(){
	 		$modalInstance.close();
 		}).error(function(){
 			console.log('Error saving organization', arguments)
 			alert('Error saving organization')
 		});
	

 	};

 	$scope.cancel = function(){
 		$modalInstance.close();
 	};

 });

