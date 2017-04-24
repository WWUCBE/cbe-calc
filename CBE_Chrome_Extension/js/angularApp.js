var app = angular.module("CBEcalc", ["xeditable"]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
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
    //console.log("mainControllerFunction()");
    $scope.classList = classList.classList;
    $scope.previousGPA = [];
    $scope.classPrefixes = classPrefixes.classPrefixes;
    $scope.gpa = (0.0).toFixed(2);
    $scope.standing = 'good';
    $scope.totalCredits = 0;
    $scope.cbe = true;

    $scope.addClass = function(){
      //console.log("addClass()");
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
      var letter = tempGrade.substring(0,1).toUpperCase();
      var mod = '';
      if(tempGrade.length >= 2){
        mod = tempGrade.substring(1,2);
        if(!(mod === '+' || mod ==='-')){
          mod = '';
        }
        //Remove disallowed modifiers
        if((mod === '+') && ((letter === 'A') || (letter === 'F'))){
          mod = '';
        }else if((mod === '-') && (letter === 'F')){
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
        if($scope.classList[i].name === $scope.name.toUpperCase()){
          //found = true;
          //$scope.classList[i].gpa = ((+$scope.classList[i].gpa + gpa)/2).toFixed(2);
          //$scope.classList[i].grade = $scope.classList[i].gpa;
          $scope.classList[i].composite = 'composite';
        }
      }

      $scope.classList.push({
        name: $scope.name.substring(0,15).toUpperCase(),
        grade: letter.toUpperCase() + mod,
        gpa: gpa.toFixed(2),
        credits: $scope.credits
      });

      $scope.name = '';
      $scope.grade = '';
      $scope.credits = '';

      if($scope.cbe){
        $scope.setGpa();
      }else{
        $scope.setGpaFinalOnly();
      }
      setProgress($scope.classList);

      var cbe = "CBE"
      if(!$scope.cbe){
        cbe = "MSCM";
      }

      return;
    };

    $scope.updatePrevious = function() {
      //console.log("updatePrevious()");
      //console.log($scope.prevGPA);
      //console.log($scope.prevCredits);
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

      if($scope.cbe){
        $scope.setGpa();
      }else{
        $scope.setGpaFinalOnly();
      }

      return;
    };

    $scope.setGpa = function() {
      var counter = 0;
      var target = 1;
      //console.log("setGpa()");
      for(var i = 0 ; i < $scope.classList.length ; i++){ //Remove unecessary "composite" flags
        $scope.classList[i].composite = "unique";
        counter = 0;
        if(($scope.classList[i].name === "IBUS 474") || ($scope.classList[i].name === "MGMT 474")){
          target = 2;
        }else{
          target = 1;
        }
        for(var j = i+1 ; j < $scope.classList.length ; j++){
          if($scope.classList[j].name === $scope.classList[i].name){
            counter++;
            if(counter >= target){
              if ($scope.classList[i].gpa > $scope.classList[j].gpa) { 
                $scope.classList[j].composite = "composite";
                $scope.classList[i].composite = "unique";
              }
            }
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
      $scope.totalCredits = countCredits;
      $scope.gpa = gpa.toFixed(2);

      //Adjust academic standing color (good, bad)
      if($scope.cbe){
        if($scope.gpa > 2.3){
          $scope.standing = 'good';
        }else{
          $scope.standing = 'bad';
        }
      }else{
        if($scope.gpa >= 3.0){
          $scope.standing = 'good';
        }else{
          $scope.standing = 'bad';
        }
      }

      //save class info
      setGradeInfo([$scope.gpa, $scope.totalCredits]);
    };

    $scope.setGpaFinalOnly = function() {
      //console.log("setGpaFinalOnly()");
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

      for(var i = 0 ; i < $scope.classList.length ; i++){
        if($scope.classList[i].composite != "composite"){
          gpa += (+$scope.classList[i].gpa * +$scope.classList[i].credits);
          credits +=  +$scope.classList[i].credits;
        }
      }

      if(gpa != 0){
        gpa = gpa / credits;
      }

      $scope.totalCredits = credits;
      $scope.gpa = gpa.toFixed(2);

      //Adjust academic standing color (good, bad)
      if($scope.cbe){
        if($scope.gpa > 2.3){
          $scope.standing = 'good';
        }else{
          $scope.standing = 'bad';
        }
      }else{
        if($scope.gpa >= 3.0){
          $scope.standing = 'good';
        }else{
          $scope.standing = 'bad';
        }
      }

      //save class info
      setGradeInfo([$scope.gpa, $scope.totalCredits]);
    };

    $scope.removeClass = function(item) {
      //console.log("removeClass()");
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);

      //Save class list
      setProgress($scope.classList);

      //save other grade info
      var cbe = "CBE"
      if(!$scope.cbe){
        cbe = "MSCM";
      }

      if($scope.cbe){
        $scope.setGpa();
      }else{
        $scope.setGpaFinalOnly();
      }
    };

    $scope.reCalc = function(index){
      //console.log("reCalc()");
      for(var i = 0 ; i < $scope.classList.length ; i++){ //Remove unecessary "composite" flags
        $scope.classList[i].composite = "unique";
        $scope.classList[i].name = $scope.classList[i].name.toUpperCase();
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
        'Z'
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
        0,
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

      if($scope.cbe){
        $scope.setGpa();
      }else{
        $scope.setGpaFinalOnly();
      }

      //save classes
      setProgress($scope.classList);
      setGradeInfo([$scope.gpa, $scope.totalCredits]);
    }

    $scope.readFromPageCBE = function(info){
      //console.debug("readFromPageCBE()");
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
        'K',
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
        'F',
        'KF',
        'S',
        'U',
        'KZ',
        'Z'
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

              //Class has a 'K' preceeding the grade
              if(tempGrade[0] === 'K' || (tempGrade[0] === 'K' && tempGrade[1] === '*')) {
                tempGrade = tempGrade.substring(1,tempGrade.length);
              }

              //If class is pass/fail, break loop and ignore it
              if((tempGrade[0] === 'S') || (tempGrade[0] === 'U')){
                break;
              }

              //credits are located one before the grade.
              tempCredits = lineArray[ind-1];
              realGrade = true;
              break;
            }
          }

          if(realGrade){
            for(var j = 0 ; j < $scope.classList.length ; j++){
              if($scope.classList[j].name === tempName){
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
      //save classes
      setProgress($scope.classList);

      //Save other grade info
      var cbe = "CBE"
      if(!$scope.cbe){
        cbe = "MSCM";
      }

      $scope.updatePrevious();
      $scope.setGpa();
      return;
    }

    $scope.readFromPageMSCM = function(info){
      //console.debug("readFromPageMSCM()");
      var localData = String(info.data);
      var lines = localData.split('\n');
      var validclasses = {
        'MATH': ['157'],
        'DSCI': ['205'],
        'ACCT': ['240','245'],
        'ECON':['206','207'],
        'MIS': ['220'],
        'MGMT':['271'],
        'PHYS':['114'],
        'CHEM': ['121']
      }
      var grades = [
        'A',
        'A-',
        'K',
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
        'F',
        'KF',
        'S',
        'U',
        'KZ',
        'Z'
      ];
      for(var i = 0 ; i < lines.length ; i++){
        //split on space or group of spaces and store in lineArray
        var lineArray = lines[i].trim().split(/\s+/);

        if(validclasses.hasOwnProperty(lineArray[0]) && validclasses[lineArray[0]].indexOf(lineArray[1].substring(0,3))>=0){
          var tempName = (lineArray[0] + ' ' + lineArray[1]).substring(0, 8)
          var tempGrade;
          var tempCredits;

          var realGrade = false;
          for(var ind = 5; ind < lineArray.length; ind++){
            if(grades.indexOf(lineArray[ind])>=0){
              tempGrade = lineArray[ind];

              //Class has a 'K' preceeding the grade
              if(tempGrade[0] === 'K' || (tempGrade[0] === 'K' && tempGrade[1] === '*')) {
                tempGrade = tempGrade.substring(1,tempGrade.length);
              }

              //If class is pass/fail, break loop and ignore it
              if((tempGrade[0] === 'S') || (tempGrade[0] === 'U')){
                break;
              }

              //credits are located one before the grade.
              tempCredits = lineArray[ind-1];
              realGrade = true;
              break;
            }
          }

          if(realGrade){
            for(var j = 0 ; j < $scope.classList.length ; j++){
              if($scope.classList[j].name === tempName){
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

      //save classes
      setProgress($scope.classList);

      $scope.updatePrevious();
      $scope.setGpaFinalOnly();

      //Save other class info
      var cbe = "CBE"
      if(!$scope.cbe){
        cbe = "MSCM";
      }

      return;
    }

    /* Function to scrape text off page and parse out class information */
    $scope.addPrevClasses = function(info){
      var localData = String(info.data);
      var tokens = localData.trim().split(/\s+/);
      var lastTok = "";
      var studId = "";
      var newUser = false;

      //Check mode
      chrome.storage.sync.get('mode', function(result){
        //console.debug("Mode: " + result.mode);
        if(typeof(result.mode) != "undefined"){
          if(result.mode === 'true'){
            $scope.cbe = true;
            //console.debug("$scope.cbe = " + result.mode);
            $scope.$apply();
          }else{
            $scope.cbe = false;
            document.getElementById("toggleSwitchBox").checked="true";
            document.getElementById("toggleSwitchBox2").checked="true";
            hide('onPageCBE');
            show('onPageMSCM');
            // Check to see if other div is visible - if so, hide MSCM div
            if(document.getElementById("notOnPage").style.display == "inline"){
              hide('onPageMSCM');
            }
            //console.debug("$scope.cbe = " + result.mode);
            $scope.$apply();
          }
        }else{
          $scope.cbe = true;
          setMode('true');
          $scope.$apply();
        }
      });

      //Get studId
      for(var i = 0 ; i < tokens.length ; i++){
        studId = tokens[i];
        if(lastTok === "ID:"){
          break;
        }else{
          lastTok = studId;
        }
      }

      //Check if student ID is the same, if not, dump memory and read page
      chrome.storage.sync.get('user', function(result){
        //Check if previous user exists
        if(typeof(result.user) != "undefined"){
          console.log(result.user);
          //Check if new ID matches last used ID
          if(studId != result.user){
            console.log("Different user");
            chrome.storage.sync.remove('CBEclasses');

            //Check classes
            chrome.storage.sync.get('CBEclasses', function(result){
              if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){ //Check to see if there are classes saved in storage
                $scope.classList = result.CBEclasses;
                //console.debug("Found previous classes");
                //console.debug($scope.classList);
                if($scope.cbe){
                  $scope.setGpa();
                }else{
                  $scope.setGpaFinalOnly();
                }
                $scope.$apply();
              }else{ //Else read from page
                console.debug("No previous classes");
                if($scope.cbe){ //CBE/MSCM toggle is on CBE
                  $scope.readFromPageCBE(info);
                }else{//CBE/MSCM toggle is on MSCM
                  $scope.readFromPageMSCM(info);
                }
                $scope.$apply();
              }
            });

            //Set user
            setUser(studId);
          }else{
            console.log("Same user");

            //Check classes
            chrome.storage.sync.get('CBEclasses', function(result){
              if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){ //Check to see if there are classes saved in storage
                $scope.classList = result.CBEclasses;
                //console.debug("Found previous classes");
                //console.debug($scope.classList);
                if($scope.cbe){
                  $scope.setGpa();
                }else{
                  $scope.setGpaFinalOnly();
                }
                $scope.$apply();
              }else{ //Else read from page
                console.debug("No previous classes");
                if($scope.cbe){ //CBE/MSCM toggle is on CBE
                  $scope.readFromPageCBE(info);
                }else{//CBE/MSCM toggle is on MSCM
                  $scope.readFromPageMSCM(info);
                }
                $scope.$apply();
              }
            });
          }
        }else{
          console.log("No previous user");
          //Check classes
          chrome.storage.sync.get('CBEclasses', function(result){
            if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){ //Check to see if there are classes saved in storage
              $scope.classList = result.CBEclasses;
              //console.debug("Found previous classes");
              //console.debug($scope.classList);
              if($scope.cbe){
                $scope.setGpa();
              }else{
                $scope.setGpaFinalOnly();
              }
              $scope.$apply();
            }else{ //Else read from page
              console.debug("No previous classes");
              if($scope.cbe){ //CBE/MSCM toggle is on CBE
                $scope.readFromPageCBE(info);
              }else{//CBE/MSCM toggle is on MSCM
                $scope.readFromPageMSCM(info);
              }
              $scope.$apply();
            }
          });

          //Set user
          setUser(studId);
        }
        $scope.$apply();
      });

      //save other grade info
      var cbe = "CBE"
      if(!$scope.cbe){
        cbe = "MSCM";
      }

      return;
    };
  }
]);

//Function to clean added classes and read classes that were removed when 'refresh' button is pressed
function clearCache(){
  chrome.storage.sync.clear();
  //console.log("Classes deleted");

  var scope = angular.element(document.getElementById("main")).scope();
  var bool = scope.cbe.toString();
  setMode(bool);

}

//function to calculate GPA point based on letter grades
function getGPAValue(string){
  //console.log("getGPAValue()");
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
      }else if(letter === "z" || letter === 'Z'){
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

//Saves mode - either 'True' or 'False', where 'True' is CBE and 'False' is MSCM
function setMode(mode) {
  chrome.storage.sync.set({'mode': mode}, function(){
    //console.debug("setMode(): " + mode);
    //console.debug('Mode Saved');
  })
}

//Save entered classes to chrome.storage.sync
function setProgress(classList) {
  chrome.storage.sync.set({'CBEclasses': classList}, function(){
    //Saves classes to variable for persistent storage
    console.debug('Classes saved');
  })
  /*
  var scope = angular.element(document.getElementById("main")).scope();
  scope.$apply(function(){
    setGradeInfo([$scope.gpa, $scope.totalCredits]);
    console.log("TEST: " + $scope.gpa + " " + $scope.totalCredits);
    scope.$apply();
  })
  */
}

function setGradeInfo(gradeInfo) {
  chrome.storage.sync.set({'gradeInfo': gradeInfo}, function(){
    //saves grade info for printing
    console.debug('Grade info saved');
  })
}

// Update the relevant fields with the new data
function setDOMInfo(info) {
  //console.log("setDomInfo()");
  var scope = angular.element(document.getElementById("main")).scope();
  scope.$apply(function(){
    scope.classList.length = 0;
    scope.addPrevClasses(info);
  });
}

function toggleView(e) {
  // Clear the cache...
  clearCache();
  // ...set CBE/MSCM mode...
  var scope = angular.element(document.getElementById("main")).scope();
  if(e.target.checked){
    hide('onPageCBE');
    show('onPageMSCM');
    setMode('false');
    scope.$apply(function(){
      scope.cbe = false;
    });
  }else{
    hide('onPageMSCM');
    show('onPageCBE');
    setMode('true');
    scope.$apply(function(){
      scope.cbe = true;
    });
  }
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
}

function bind(e) {
  if(e.target.id == "toggleSwitchBox2"){
    console.log("toggleSwitchBox2");
    document.getElementById("toggleSwitchBox").checked = document.getElementById("toggleSwitchBox2").checked;
  }
  if(e.target.id == "toggleSwitchBox"){
    console.log("toggleSwitchBox");
    document.getElementById("toggleSwitchBox2").checked = document.getElementById("toggleSwitchBox").checked;
  }
  toggleView(e);
}

function minimize(e) {
  console.log("clicked");
  document.getElementById('toggle').checked = false;
}

function setUser(user) {
  chrome.storage.sync.set({'user': user}, function(){
    //saves user to check for a page reload
    console.debug('User saved');
  })
}

function printSection(e) {
  console.log("Sent print message");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "print"}, function(response) {
      //console.log(response.farewell);
    });
  });
}

//Add listener to CBE/MSCM toggle
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('toggleSwitchBox').addEventListener('change', bind);
  document.getElementById('toggleSwitchBox2').addEventListener('change', bind);
  document.getElementById('menu').addEventListener('click', minimize);
  document.getElementById('backFilter').addEventListener('click', minimize);
  document.getElementById('printButton').addEventListener('click', printSection);
  document.getElementById('printButton2').addEventListener('click', printSection);
});

//listener to purge storage when 'refreshButton' is pressed
document.getElementById("refreshButton").addEventListener("click", function () {
  clearCache();
});

document.getElementById("refreshButton2").addEventListener("click", function () {
  clearCache();
});

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
