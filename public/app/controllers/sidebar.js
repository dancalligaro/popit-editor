angular.module('cargoNgApp')

 .controller('SidebarController', function($scope, $route, $routeParams, $location, $timeout) {

 	$scope.$on('$routeChangeSuccess', function(event, current) { 
 		$scope.currentPath = current.$$route.originalPath;
	});

 })