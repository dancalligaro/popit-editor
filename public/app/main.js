
angular.module('cargoNgApp', ['ngRoute', 'ngCkeditor', 'ui.ace', 'ui.bootstrap']).
run(function($rootScope){
  $rootScope.bootstrapData = window.__bootstrapData;
})
;

