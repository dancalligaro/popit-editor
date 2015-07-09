angular.module('cargoNgApp')
 .controller('PersonalizeController', function($scope, $routeParams, $http) {

    $scope.customization = {};

    $http.get('/api/customization').then(function(res){
      $scope.customization = res.data;
    });

    $scope.save = function(){

      $http.post('/api/customization', {customization: $scope.customization})
      .then(function(res){
        if(res.data && res.data.status == 'ok'){
          alert('Data saved ok!');
        }else{
          if(res.data.message){
            alert('Error saving data: ' + res.data.message);
          }else{
            alert('Unknown error saving data');
          }
        }
      })
      .catch(function(){
        alert('Unknown error saving data');
      })
    };

 })

