angular.module('cargoNgApp')

  .controller('PasswordController', function($scope, $routeParams, $http) {

    $scope.updatePassword = function(){

      if($scope.password != $scope.password2){
        alert("Passwords don't match");
        return
      }

      if(!$scope.password){
        alert('Enter a password');
        return;
      }

      $http.post('/api/password', {password: $scope.password})
      .then(function(res){
        if(res.data.status == 'ok'){
          alert('password changed')
        }else{
          if(res.data.message){
            alert(res.data.message)
          }else{
            alert('Unknown error updating password')
          }
        }
      })
      .catch(function(){
        alert('Unknown error updating password')
      })
    };


 })




