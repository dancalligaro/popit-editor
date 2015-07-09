angular.module('cargoNgApp')

 .controller('PersonEditController', function($scope) {

 	$scope.person = {};

 	$scope.calcName = function(){
 		$scope.person.name = ($scope.person.given_name || '') + ' ' + ($scope.person.family_name || '');
 	};

 	$scope.save = function(){
 		alert('saving now')
 	};

 	$scope.cancel = function(){
 		alert('cancelling')
 	};

 });

