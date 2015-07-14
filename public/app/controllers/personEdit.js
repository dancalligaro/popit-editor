angular.module('cargoNgApp')

 .controller('PersonEditController', function($scope, $modalInstance, $http, item) {

 	$scope.person = {};

 	$scope.person.name = item.name;
 	if(item.given_name) $scope.person.given_name = item.given_name;
 	if(item.family_name) $scope.person.family_name = item.family_name;
 	if(item.gender) $scope.person.gender = item.gender;
 	if(item.image) $scope.person.image = item.image;
 	if(item.identifiers && item.identifiers.length > 0){
 		if(item.identifiers[0].scheme) $scope.person.idtype = item.identifiers[0].scheme;
 		if(item.identifiers[0].identifier) $scope.person.idnumber = item.identifiers[0].identifier;
 	}

 	console.log('this is the received item', item);

 	$scope.calcName = function(){
 		$scope.person.name = ($scope.person.given_name || '') + ' ' + ($scope.person.family_name || '');
 	};

 	$scope.save = function(){
 		// window.__bootstrapData.popitKey
 		var personToSave = {
 			name: $scope.person.name, 
 			given_name: $scope.person.given_name, 
 			family_name: $scope.person.family_name,
 			gender: $scope.person.gender,
 			image: $scope.person.image,
 		}

 		if( $scope.person.idnumber || $scope.person.idtype){
 			personToSave.identifiers = [
 				{
 					identifier: $scope.person.idnumber, 
 					scheme: $scope.person.idtype
 				}
 			] 
 		}

 		var url = "/proxy/persons/" + item.id;
 		
 		$http({
 			method: 'PUT',
 			url: url, 
 			data: personToSave, 
 		}).success(function(){
	 		$modalInstance.close();
 		}).error(function(){
 			console.log('Error saving person', arguments)
 			alert('Error saving person')
 		});
	


 	};

 	$scope.cancel = function(){
 		$modalInstance.close();
 	};

 });

