var app = angular.module("CBEcalc", ["xeditable"]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});


app.controller('MainCtrl', [
  '$scope',
  function($scope){
    //console.log("mainControllerFunction()");
    $scope.classList = [];
    $scope.previousGPA = [];
    $scope.classPrefixes = [];
    $scope.gpa = (0.0).toFixed(2);
    $scope.standing = 'good';
    $scope.totalCredits = 0;
    $scope.cbe = true;
    $scope.mode = "cbe";

    /* Triggered when clicking the "ADD" button in the ui to 
     * add a class. */
    $scope.addClass = function(){
      /* if any of the three text fields are empty, do nothing */
      if(!$scope.name || $scope.name === ''){
        return;
      }
      if(!$scope.grade || $scope.grade === ''){
        return;
      }
      if(!$scope.credits || $scope.credits === '' || $scope.credits != parseInt($scope.credits, 10)){
        return;
      }

      /* see if the new class is a duplicate, if it is, mark 
       * the old one as such */
      for(var i = 0 ; i < $scope.classList.length ; i++){
        if($scope.classList[i].name === $scope.name.toUpperCase()){
          $scope.classList[i].composite = 'composite';
        }
      }

      /* convert the letter grade into a numbered grade */
      var tempGrade = $scope.grade;
      var gpa = getGPAValue(tempGrade);

      /* add the new class to the global list*/
      $scope.classList.push({
        name: $scope.name.substring(0,15).toUpperCase(),
        grade: tempGrade.toUpperCase(),
        gpa: gpa.toFixed(2),
        credits: $scope.credits
      });

      /* reset the fields (remember, these are linked with
       * the  html) */
      $scope.name = '';
      $scope.grade = '';
      $scope.credits = '';

      /* update the GPA with the appropriate algorithm */
      if($scope.cbe){
        $scope.setGpaCBE();
      }else{
        $scope.setGpaMSCM();
      }

      /* save the new classlist to chrome storage */
      storeClassList($scope.classList);

      return;
    };

    /* triggered when a class is modified */
    $scope.reCalc = function(index){
      // console.log("reCalc()");

      /* rewrite idea:
         Validate grade using regex, then pass to getGPAValue()*/


      /* Recalculate if it's unique or not */
      // need to user updated version? Maybe add "mscm dupe" to class objects
      if (!$scope.cbe) {
        for(var i = 0 ; i < $scope.classList.length ; i++){ //Remove unecessary "composite" flags
          $scope.classList[i].composite = "unique";
          $scope.classList[i].name = $scope.classList[i].name.toUpperCase();
          for(var j = i+1 ; j < $scope.classList.length ; j++){
            if($scope.classList[j].name === $scope.classList[i].name){
              $scope.classList[i].composite = "composite";
            }
          }
        } 
      }

     /* ISSUE: doesn't handle K grades. Does it really have to? */
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
        $scope.setGpaCBE();
      }else{
        $scope.setGpaMSCM();
      }

      // //save classes
      storeClassList($scope.classList);
    }

    

    $scope.setGpaCBE = function() {
      var gradeInfo = calculateCBEGPA($scope.classList);
      $scope.totalCredits = gradeInfo.credits;
      $scope.gpa = gradeInfo.gpa;
      $scope.classList = gradeInfo.classList;

      //Adjust academic standing color (good, bad)
      $scope.updateColorWarning();

      //save class info
      setGradeInfo([$scope.gpa, $scope.totalCredits]);
    };

    $scope.setGpaMSCM = function() {
      var gradeInfo = calculateMSCMGPA($scope.classList);

      $scope.totalCredits = gradeInfo.credits;
      $scope.gpa = gradeInfo.gpa;
      $scope.classList = gradeInfo.classList;

      //Adjust academic standing color (good, bad)
			$scope.updateColorWarning();

      //save class info
      setGradeInfo([$scope.gpa, $scope.totalCredits]);
    };

    /* controls the color change of the GPA display */
    $scope.updateColorWarning = function() {
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
    };

    $scope.removeClass = function(item) {
      //console.log("removeClass()");
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);

      //Save class list
      storeClassList($scope.classList);

      //save other grade info
      var cbe = "CBE"
      if(!$scope.cbe){
        cbe = "MSCM";
      }

      if($scope.cbe){
        $scope.setGpaCBE();
      }else{
        $scope.setGpaMSCM();
      }
    };


    /* Function to scrape text off page and parse out class information */
    $scope.addPrevClasses = function(info){
      parseTranscript(info.data);
      
      var rawTranscriptText = String(info.data);
      var tokens = rawTranscriptText.trim().split(/\s+/);

      /* set the mode (CBE or MSCM) to whatever was last looked at) */
      chrome.storage.sync.get('mode', function(result){
        //console.debug("Mode: " + result.mode);
        if(typeof(result.mode) != "undefined"){
          if(result.mode === 'true'){
            setMode("cbe");
          }else{
            setMode("mscm");
            // Check to see if other div is visible - if so, hide MSCM div
            if(document.getElementById("notOnPage").style.display == "inline"){
              hide('onPageMSCM');
            }
            //console.debug("$scope.cbe = " + result.mode);
            $scope.$apply();
          }
        }else{
          $scope.cbe = true;
          saveMode('true');
          $scope.$apply();
        }
      });

      /* save the student name and ID for later use */
      var re = /Name:(.*) ID: (.*) Previous/;
      var name = re.exec(rawTranscriptText)[1];
      var id = re.exec(rawTranscriptText)[2];
      console.log("name: " + name + " ID: " + id);
      saveStudentName(name);

      /* check if id is same as saved */
      chrome.storage.sync.get('studentID', function(storedID){
        /* if they're the same, we pull saved class list*/
        if (id === storedID) {
          chrome.storage.sync.get('CBEclasses', function(result){
            $scope.classList = result.CBEclasses;
          });
        } else {
          /* save this users ID */
          chrome.storage.sync.clear();
          chrome.storage.sync.set({'studentID': id});
        }
      });
          
      // Check to see if there are classes saved in storage
      chrome.storage.sync.get('CBEclasses', function(result){
        if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){ 
          $scope.classList = result.CBEclasses;

          if($scope.cbe){
            $scope.setGpaCBE();
          }else{
            $scope.setGpaMSCM();
          }
          $scope.$apply();
        }else{ //Else read from page
          console.debug("No previous classes");
          if($scope.cbe){ //CBE/MSCM toggle is on CBE
            $scope.classList = parseClassesCBE(info);

			      $scope.setGpaCBE();
          }else{//CBE/MSCM toggle is on MSCM
            $scope.classList = parseClassesMSCM(info);

			      $scope.setGpaMSCM();
          }

          storeClassList($scope.classList);
          $scope.$apply();
        }
      });
 
      $scope.$apply();
     
      return;
    };
  }
]);

//Function to clean added classes and read classes that were removed when 'refresh' button is pressed
function clearCache(){
  chrome.storage.sync.clear();
  var scope = angular.element(document.getElementById("main")).scope();
  var bool = scope.cbe.toString();
  saveMode(bool);
}

//Saves mode - either 'True' or 'False', where 'True' is CBE and 'False' is MSCM
function saveMode(mode) {
  chrome.storage.sync.set({'mode': mode});
}

/* takes string, either "cbe" or "mscm" and sets the mode appropriatly.*/
function setMode(mode) {
    $scope.mode = mode;
    if (mode === "cbe") {
      document.getElementById("toggleSwitchBox").checked="false";
      document.getElementById("toggleSwitchBox2").checked="false";
      show('onPageCBE');
      hide('onPageMSCM');
      saveMode('true');
      $scope.cbe = true;
      $scope.setGpaCBE();
    } else {
      document.getElementById("toggleSwitchBox").checked="true";
      document.getElementById("toggleSwitchBox2").checked="true";
      hide('onPageCBE');
      show('onPageMSCM');
      saveMode('false');
      $scope.cbe = false;
      $scope.setGpaMSCM();
    }

    $scope.apply();
}

//Save entered classes to chrome.storage.sync
function storeClassList(classList) {
  chrome.storage.sync.set({'CBEclasses': classList}, function(){
    //Saves classes to variable for persistent storage
    console.debug('Classes saved');
  })
}

/* Saves total GPA information, used for printing */
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
  //clearCache();
  // ...set CBE/MSCM mode...
  var scope = angular.element(document.getElementById("main")).scope();
  if(e.target.checked){
    hide('onPageCBE');
    show('onPageMSCM');
    saveMode('false');
    scope.$apply(function(){
      scope.cbe = false;
    });
  }else{
    hide('onPageMSCM');
    show('onPageCBE');
    saveMode('true');
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

//saves name so print formatter can grab it
function saveStudentName(name) {
  chrome.storage.sync.set({'studentName': name}, function(){

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
  document.getElementById('closeButton').addEventListener('click', minimize);
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
  // clear everything from the cache to force a refresh
  //chrome.storage.sync.clear();

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
