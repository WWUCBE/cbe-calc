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
        name: $scope.name.substring(0,15),
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
    /* Proof of concept to fetch page content */
    $scope.updateDOMInfo = function(info){
      document.getElementById('total').textContent = info.total;
      document.getElementById('inputs').textContent = info.inputs;
      document.getElementById('buttons').textContent = info.buttons;
      document.getElementById('data').textContent = info.data; //Actual text
    };
    /* Function to scrape text off page and parse out class information */
    $scope.addPrevClasses = function(info){
      var localData = String(info.data);
      console.log(data);
      var lines = localData.split('\n');

      for(var i = 0 ; i < lines.length ; i++){
        $scope.classList.push({
          name: $scope.name,
          grade: 'A',
          gpa: 4,
          credits: 4
        });
      }
    };
  }
]);


// Update the relevant fields with the new data
function setDOMInfo(info) {
  var scope = angular.element(document.getElementById("main")).scope();
  scope.$apply(function(){
    scope.addPrevClasses(info);
  });
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called
        //    from the receiving end (content script)
        setDOMInfo);
  });
});
