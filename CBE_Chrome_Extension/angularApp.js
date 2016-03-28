var app = angular.module('CBEcalc', []);

app.factory('classList', [function(){
  var o = {
    classList: []
  };
  return o;
}]);

app.factory('classPrefixes', [function(){
  var c = {
    classPrefixes: []
  };
  return c;
}]);

app.controller('MainCtrl', [
  '$scope',
  'classList',
  'classPrefixes',
  function($scope, classList, classPrefixes){
    $scope.classList = classList.classList;
    $scope.previousGPA = [];
    $scope.classPrefixes = classPrefixes.classPrefixes;
    $scope.gpa = (0.0).toFixed(2);
    $scope.totalCredits = 0;

    $scope.addClass = function(){
      if(!$scope.name || $scope.name === ''){
        return;
      }
      if(!$scope.grade || $scope.grade === ''){
        return;
      }
      if(!$scope.credits || $scope.credits === '' || $scope.credits != parseInt($scope.credits, 10)){
        return;
      }

      var gpa = 0;
      var tempGrade = $scope.grade;
      var letter = tempGrade.substring(0,1);
      var mod = '';
      if(tempGrade.length >= 2){
        mod = tempGrade.substring(1,2);
        if(!(mod === '+' || mod ==='-')){
          mod = '';
        }
      }
      if(letter === "a" || letter === 'A'){
        gpa = 4;
      }else if(letter === "b" || letter === 'B'){
        gpa = 3;
      }else if(letter === "c" || letter === 'C'){
        gpa = 2;
      }else if(letter === "d" || letter === 'D'){
        gpa = 1;
      }else if(letter === "f" || letter === 'F'){
        gpa = 0;
      }else{
        return;
      }

      if(mod === '+' && gpa < 4){
        gpa += 0.3;
      }else if(mod === '-'){
        gpa -= 0.3;
      }

      $scope.classList.push({
        name: $scope.name,
        grade: letter.toUpperCase() + mod,
        gpa: gpa.toFixed(2),
        credits: $scope.credits
      });

      $scope.name = '';
      $scope.grade = '';
      $scope.credits = '';

      $scope.setGpa();

      return;
    };

    $scope.updatePrevious = function() {
      console.log("made it into function");
      console.log($scope.prevGPA);
      console.log($scope.prevCredits);
      if(!$scope.prevGPA || $scope.prevGPA === ''){
        return;
      }
      if(parseInt($scope.prevGPA) > 4){
        return;
      }
      if(!$scope.prevCredits || $scope.prevCredits === ''){
        return;
      }
      if($scope.prevCredits != parseInt($scope.prevCredits, 10)){
        return;
      }
      if($scope.previousGPA.length > 0){
        $scope.previousGPA.splice(0, $scope.previousGPA.length);
      }

      $scope.previousGPA.push({
        gpa: parseFloat($scope.prevGPA).toFixed(2),
        prevCredits: parseInt($scope.prevCredits)
      });

      $scope.prevGPA = '';
      $scope.prevCredits = '';

      $scope.setGpa();

      return;
    };

    $scope.setGpa = function() {
      var gpa = 0.00;
      var credits = 0.00;

      if($scope.previousGPA.length > 0){
        gpa = $scope.previousGPA[0].gpa * $scope.previousGPA[0].prevCredits;
        credits = $scope.previousGPA[0].prevCredits;
      }

      for(var i = 0 ; i < $scope.classList.length ; i++){
        gpa += (+$scope.classList[i].gpa * +$scope.classList[i].credits);
        credits += +$scope.classList[i].credits;
      }
      if(gpa != 0){
        gpa = gpa / credits;
      }
      $scope.totalCredits = credits;
      $scope.gpa = gpa.toFixed(2);
    };

    $scope.removeClass = function(item) {
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);
      $scope.setGpa();
    };

  }
]);
