angular.module('cargoNgApp')

 .controller('PersonsController', function($scope, $http, $timeout, $modal) {

 	
 	$scope.rows = [];
 	$scope.result = {};
 	$scope.page = 1;

 	$scope.doSearch = function(){
 		$scope.page = 1;
 		loadSearch();
 	};

 	$scope.goToPage = function(page){
 		$scope.page = page;
 		loadSearch();
 	};

 	$scope.openEdit = function(itemId){

		var modalInstance = $modal.open({
	      animation: true, //$scope.animationsEnabled,
	      templateUrl: '/app/partials/personEdit.html',
	      controller: 'PersonEditController',
	      //size: size,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });

 	};

 	function loadSearch(){

 		var url = "https://cargografias.popit.mysociety.org/api/v0.1/search/persons?"
 		url += "page=" + $scope.page;
 		url += "&q=name:" + $scope.search.name;

 		$http.get(url).
		  success(function(data, status, headers, config) {

		    $scope.rows = data.result;
		    $scope.result = data;

		    $scope.total = data.total;
		    $scope.from = (data.page - 1) * data.per_page + 1;
		    $scope.to = (data.page - 1) * data.per_page + data.result.length;
		    $scope.totalPages = Math.ceil( data.total / data.per_page );
		    $scope.pages = [];
		    for(var i = $scope.page - 5; i <= $scope.page + 5 ; i++){
		    	if(i>0 && i <= $scope.totalPages ){
		    		$scope.pages.push(i);	
		    	}		    	
		    }

		  }).
		  error(function(data, status, headers, config) {
		    console.log("ERROR HERE")
		  }); 		
 	}


 })