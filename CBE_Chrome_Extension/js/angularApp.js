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
    $scope.gpaCBE = {gpa: 0, credits: 0};
    $scope.gpaMSCM = 0;
    $scope.gpa = $scope.gpaCBE;
    $scope.standing = 'good';
    $scope.totalCredits = 0;
    $scope.cbe = true;
    $scope.mode = "cbe";
    /* used to apply invalid input class to input fields.
      * Pristine used to only apply the styles AFTER the 
      * user clicks the button*/
    $scope.validInput = {
      pristine: true,
      name: false,
      credits: false,
      grade: false
    };

    /* Triggered when clicking the "ADD" button in the ui to 
     * add a class. */
    $scope.addClass = function(){
      console.log("adding class...");
      /* Create a course object and populate it accordingly */
      var splitName = $scope.name.split(" ");
      var course = createCourse(splitName[0], splitName[1], $scope.credits, $scope.grade);
      
      /* set isCBE/isMSCM fields as well as countsFor */
      setProgramStatus(course);
      
      $scope.validInput.name = course.isCBE || course.isMSCM;
      $scope.validInput.grade = course.gpa >= 0;
      $scope.validInput.credits = course.credits >= 0;

      console.log(course);
      console.log($scope.validInput);
     
      if ($scope.validInput.name && $scope.validInput.grade && $scope.validInput.credits) {
        $scope.classList.push(course);
        setDupeStatus($scope.classList);
        $scope.recalculateGPA();

        /* reset the fields (remember, these are linked with
         * the  html) */
        $scope.name = '';
        $scope.grade = '';
        $scope.credits = '';
        
        $scope.validInput.pristine = true;
      } else {
        console.log("invalid class!");
        $scope.validInput.pristine = false;
      }

      return;
    };

    /* triggered when a class is modified */
    $scope.modifyClass = function(index){
       
    }

    $scope.recalculateGPA = function() {
      $scope.gpaCBE = calculateCBEGPA($scope.classList);
      $scope.gpaMSCM = calculateMSCMGPA($scope.classList);
     
      if ($scope.cbe) {
        $scope.gpa = $scope.gpaCBE;
      } else {
        $scope.gpa = $scope.gpaMSCM;
      }
      $scope.updateColorWarning();

    }

    /* controls the color change of the GPA display */
    $scope.updateColorWarning = function() {
    	//Adjust academic standing color (good, bad)
      if($scope.cbe){
        if($scope.gpa.gpa > 2.3){
          $scope.standing = 'good';
        }else{
          $scope.standing = 'bad';
        }
      }else{
        if($scope.gpa.gpa >= 3.0){
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

      $scope.recalculateGPA();
    };

    $scope.switchMode = function() {
      if ($scope.mode === "cbe") {
        $scope.cbe = false;
        $scope.mode = "mscm";
        $scope.gpa = $scope.gpaMSCM;
      } else {
        $scope.cbe = true;
        $scope.mode = "cbe";
        $scope.gpa = $scope.gpaCBE;
      }
    };

    /* Function to scrape text off page and parse out class information */
    $scope.initialize = function(info){
      var re = /Name:(.*) ID: (.*) Previous/;
      var name = re.exec(info.data);
      var id = re.exec(info.data);

      $scope.mode = "cbe";
      chrome.storage.sync.get("id", function(result) {
        console.log(result.id);
        if (result != undefined && result.id === id) {
          console.log("this is odd");
          chrome.storage.get("classList", function(result) {
            $scope.classList = result.classList;
          });
        } else {
          $scope.classList = parseTranscript(info.data);
          $scope.recalculateGPA();
          $scope.$apply();
        }
      });
      

//      saveStudentName(name);
//      saveStudentID(id);

      /* set the mode (CBE or MSCM) to whatever was last looked at) */
//      chrome.storage.sync.get('mode', function(result){
//        //console.debug("Mode: " + result.mode);
//        if(typeof(result.mode) != "undefined"){
//          if(result.mode === 'true'){
//            setMode("cbe");
//          }else{
//            setMode("mscm");
//            // Check to see if other div is visible - if so, hide MSCM div
//            if(document.getElementById("notOnPage").style.display == "inline"){
//              hide('onPageMSCM');
//            }
//            //console.debug("$scope.cbe = " + result.mode);
//            $scope.$apply();
//          }
//        }else{
//          $scope.cbe = true;
//          saveMode('true');
//          $scope.$apply();
//        }
//      });
//
//
//      /* check if id is same as saved */
//      chrome.storage.sync.get('studentID', function(storedID){
//        /* if they're the same, we pull saved class list*/
//        if (id === storedID) {
//          chrome.storage.sync.get('CBEclasses', function(result){
//            $scope.classList = result.CBEclasses;
//          });
//        } else {
//          /* save this users ID */
//          chrome.storage.sync.clear();
//          chrome.storage.sync.set({'studentID': id});
//        }
//      });
//          
//      // Check to see if there are classes saved in storage
//      chrome.storage.sync.get('CBEclasses', function(result){
//        if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){ 
//          $scope.classList = result.CBEclasses;
//
//          if($scope.cbe){
//            $scope.setGpaCBE();
//          }else{
//            $scope.setGpaMSCM();
//          }
//          $scope.$apply();
//        }else{ //Else read from page
//          console.debug("No previous classes");
//          if($scope.cbe){ //CBE/MSCM toggle is on CBE
//            $scope.classList = parseClassesCBE(info);
//
//			      $scope.setGpaCBE();
//          }else{//CBE/MSCM toggle is on MSCM
//            $scope.classList = parseClassesMSCM(info);
//
//			      $scope.setGpaMSCM();
//          }
//
//          storeClassList($scope.classList);
//          $scope.$apply();
//        }
//      });
// 
//      $scope.$apply();
//     
//      return;
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
    scope.initialize(info);
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
  document.getElementById('closeButton').addEventListener('click', minimize);
  document.getElementById('backFilter').addEventListener('click', minimize);
  document.getElementById('printButton').addEventListener('click', printSection);
});

//listener to purge storage when 'refreshButton' is pressed
document.getElementById("refreshButton").addEventListener("click", function () {
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
