angular.module('cargoNgApp')

 .controller('MembershipEditController', function($scope, $modalInstance, $http, item) {

 	$scope.membership = item;

 	console.log('this is the received membership', item);

 	$scope.save = function(){

 		// window.__bootstrapData.popitKey
 		var url = "/proxy/memberships/" + item.id;

 		$http({
 			method: 'PUT',
 			url: url, 
 			data: $scope.membership
 		}).success(function(){
	 		$modalInstance.close();
 		}).error(function(){
 			console.log('Error saving membership', arguments)
 			alert('Error saving membership')
 		});

 	};

 	$scope.cancel = function(){
 		$modalInstance.close();
 	};

 });

