var app = angular.module("CBEcalc", ["xeditable"]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  //editableOptions.buttons = no;
});

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
    $scope.standing = 'good';
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

      //var found = false;
      for(var i = 0 ; i < $scope.classList.length ; i++){
        if($scope.classList[i].name === $scope.name){
          //found = true;
          //$scope.classList[i].gpa = ((+$scope.classList[i].gpa + gpa)/2).toFixed(2);
          //$scope.classList[i].grade = $scope.classList[i].gpa;
          $scope.classList[i].composite = 'composite';
        }
      }

      //if(!found){
      $scope.classList.push({
        name: $scope.name.substring(0,15),
        grade: letter.toUpperCase() + mod,
        gpa: gpa.toFixed(2),
        credits: $scope.credits
      });
      //}

      $scope.name = '';
      $scope.grade = '';
      $scope.credits = '';

      $scope.setGpa();
      setProgress($scope.classList);

      return;
    };

    $scope.updatePrevious = function() {
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
      for(var i = 0 ; i < $scope.classList.length ; i++){ //Remove unecessary "composite" flags
        $scope.classList[i].composite = "unique";
        for(var j = i+1 ; j < $scope.classList.length ; j++){
          if($scope.classList[j].name === $scope.classList[i].name){
            $scope.classList[i].composite = "composite";
          }
        }
      }

      var gpa = 0.00;
      var credits = 0.00;
      var countCredits = 0.00; //The number of credits minus credits from classes that were retaken

      for(var i = 0 ; i < $scope.classList.length ; i++){
        gpa += (+$scope.classList[i].gpa * +$scope.classList[i].credits);
        countCredits += +$scope.classList[i].credits;
        if($scope.classList[i].composite != "composite"){
          credits +=  +$scope.classList[i].credits;
        }
      }

      if(gpa != 0){
        gpa = gpa / countCredits;
      }
      $scope.totalCredits = credits;
      $scope.gpa = gpa.toFixed(2);

      //Adjust academic standing (good, ok, bad)
      if($scope.gpa > 2.3){
        $scope.standing = 'good';
      }else{
        $scope.standing = 'bad';
      }

    };

    $scope.printSection = function() {
        window.print();
    }

    $scope.removeClass = function(item) {
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);
      $scope.setGpa();
    };

    $scope.reCalc = function(index){
      for(var i = 0 ; i < $scope.classList.length ; i++){ //Remove unecessary "composite" flags
        $scope.classList[i].composite = "unique";
        for(var j = i+1 ; j < $scope.classList.length ; j++){
          if($scope.classList[j].name === $scope.classList[i].name){
            $scope.classList[i].composite = "composite";
          }
        }
      }

      var grades = [
        'A',
        'A-',
        'B',
        'B+',
        'B-',
        'C',
        'C+',
        'C-',
        'D',
        'D+',
        'D-',
        'F',
      ];
      var gpas = [
        4,
        3.7,
        3,
        3.3,
        2.7,
        2,
        2.3,
        1.7,
        1,
        1.3,
        0.7,
        0
      ];
      if(grades.indexOf($scope.classList[index].grade.toUpperCase()) < 0){
        $scope.classList[index].gpa = 0;
        $scope.classList[index].credits = 0;
        $scope.classList[index].grade = "invalid";
      }else{
        $scope.classList[index].gpa = gpas[grades.indexOf($scope.classList[index].grade.toUpperCase())].toFixed(2);
        $scope.classList[index].grade = $scope.classList[index].grade.toUpperCase();
      }

      $scope.setGpa();
    }

    /* Function to scrape text off page and parse out class information */
    $scope.addPrevClasses = function(info){
      var localData = String(info.data);
      var lines = localData.split('\n');
      var headers = [
        'ECON',
        'ACCT',
        'DSCI',
        'MIS',
        'FIN',
        'MKTG',
        'OPS',
        'MGMT',
        'IBUS',
        'HRM'
      ];
      var grades = [
        'A',
        'A-',
        'KA',
        'KA-',
        'B',
        'B+',
        'B-',
        'KB',
        'KB+',
        'KB-',
        'C',
        'C+',
        'C-',
        'KC',
        'KC+',
        'KC-',
        'D',
        'D+',
        'D-',
        'KD',
        'KD+',
        'KD-',
        'F'
      ];
      for(var i = 0 ; i < lines.length ; i++){
        //split on space or group of spaces and store in lineArray
        var lineArray = lines[i].trim().split(/\s+/);

        if(headers.indexOf(lineArray[0]) >= 0){
          var tempName = (lineArray[0] + ' ' + lineArray[1]).substring(0, 8)
          var tempGrade;
          var tempCredits;
          /*
          for(var j = 0 ; j < grades.length ; j++){
            if((lineArray.indexOf(grades[j]) >= 0) || (lineArray.indexOf('K' + grades[j]) >= 0)){
              tempGrade = lineArray[j];
              break;
            }
          }*/
          var realGrade = false;
          for(var ind = 5; ind < lineArray.length; ind++){
            if(grades.indexOf(lineArray[ind])>=0){
              tempGrade = lineArray[ind];
              if(tempGrade[0] === 'K'){
                tempGrade = tempGrade.substring(1,tempGrade.length);
              }
              //credits are located one before the grade.
              tempCredits = lineArray[ind-1];
              realGrade = true;
              break;
            }
          }

          if(realGrade){
            //var found = false;
            for(var j = 0 ; j < $scope.classList.length ; j++){
              if($scope.classList[j].name === tempName){
                //found = true;
                //$scope.classList[j].gpa = ((+$scope.classList[j].gpa + +getGPAValue(tempGrade).toFixed(1))/2).toFixed(2);
                $scope.classList[j].composite = 'composite';
              }
            }

            $scope.classList.push({
              name: tempName,
              grade: tempGrade,
              gpa: getGPAValue(tempGrade).toFixed(1),
              credits: tempCredits
            });
          }
        }
      }
      $scope.setGpa();
      setProgress($scope.classList);
      return;
    };
  }
]);
//function to calculate GPA point based on letter grades
function getGPAValue(string){
  var gpa;
  var letter = string.substring(0,1);
  if(string.length >= 2){
        var mod = string.substring(1,2);
        if(!(mod === '+' || mod ==='-')){
          var mod = '';
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
  return gpa;
}

//TODO: fix storage functions

//Save entered classes when minimized
function setProgress(classList) {
  chrome.storage.local.set({'classes': classList}, function(){
    console.debug('Classes Saved');
    //TEST RETREIVAL
    chrome.storage.local.get('classes', function(result){
      classList = result.classes;
      console.debug(classList);
    })
    //END TEST
  })
}

//Retreive classes when maximized (If previous classes exist)
function getProgress(classList) {
  chrome.storage.local.get('classes', function(result){
    classList = result.classes;
    console.debug('Classes retreived');
  })
}


// Update the relevant fields with the new data
function setDOMInfo(info) {
  var scope = angular.element(document.getElementById("main")).scope();
  scope.$apply(function(){
    scope.classList.length = 0;
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
