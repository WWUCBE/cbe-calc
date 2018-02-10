var app = angular.module("CBEcalc", ["xeditable"]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});

/* ugh. Needs refactoring. It pushes courses onto the 
 * output list if they are invalid (so user can actually
 * edit typos and not have the course totally disapear)
 * or if they have a isCBE/MSCM attribute that matches
 * the mode. */
app.filter('programFilter', function() {
  return function(courseList, modeMSCM) {
    var out = [];
    angular.forEach(courseList, function(course) {
      if (!course.isValid.course) {
        out.push(course);
      } else {
        if (modeMSCM) {
          if (course.isMSCM) {
            out.push(course);
          }
        } else {
          if (course.isCBE) {
            out.push(course);
          }
        }
      }
    });

    return out;
  };
});

app.controller('MainCtrl', [
  '$scope',
  function($scope){
    //console.log("mainControllerFunction()");
    $scope.classList = [];
    $scope.gpaCBE = {gpa: 0, credits: 0, badStanding: true};
    $scope.gpaMSCM = 0;
    $scope.totalCredits = 0;
    $scope.modeMSCM;
    $scope.rawTranscript;
    /* used to apply invalid input class to input fields.
      * Pristine used to only apply the styles AFTER the 
      * user clicks the button*/
    $scope.validInput = {
      pristine: true,
      name: false,
      credits: false,
      grade: false
    };

    /* Function to scrape text off page and parse out class information */
    $scope.initialize = function(page){
      //chrome.storage.local.clear();
      $scope.rawTranscript = page.data;
      
      var student = $scope.getNameAndID();

      chrome.storage.local.get("studentID", function(result) {
        if (result != undefined && result.studentID === student.id) {
          $scope.restoreSavedData();
        } else {
          $scope.$apply($scope.freshStart());
          
        }
      });
    };

    /* Triggered when clicking the "ADD" button in the ui to 
     * add a class. */
    $scope.addClass = function(){
      var v = validateInput($scope.name, $scope.grade, $scope.credits);

      /* copy values over to the scoped object */
      Object.assign($scope.validInput, v.validity);

      if (v.validity.course) {
        $scope.classList.push(v.newCourse);
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
    };

    /* triggered when a class is modified */
    $scope.modifyClass = function(course){
      var newCourse = validateInput(course.name, course.grade, course.credits).newCourse;
      Object.assign(course, newCourse);

      setDupeStatus($scope.classList);
      $scope.recalculateGPA();
      $scope.saveClassInfo();
    };
    
    $scope.recalculateGPA = function() {
      $scope.gpaCBE = calculateCBEGPA($scope.classList);
      $scope.gpaMSCM = calculateMSCMGPA($scope.classList);

      $scope.gpaCBE.badStanding = $scope.gpaCBE.gpa < 2.3;
      $scope.gpaMSCM.badStanding = $scope.gpaMSCM.gpa < 3.0;
    };

    $scope.removeClass = function(item) {
      //console.log("removeClass()");
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);

      //Save class list
      setDupeStatus($scope.classList);
      $scope.recalculateGPA();

      $scope.saveClassInfo();
    };



    $scope.freshStart = function() {
      chrome.storage.local.clear();
      $scope.classList = parseTranscript($scope.rawTranscript);
      $scope.recalculateGPA();

      $scope.modeMSCM = false;
      $scope.name = '';
      $scope.grade = '';
      $scope.credits = '';

      var student = $scope.getNameAndID();
      saveNameAndID(student.name, student.id);
      $scope.saveClassInfo();
    };

    $scope.getNameAndID = function() {
      var re = /Name:(.*) ID: (.*) Previous/;
      var name = re.exec($scope.rawTranscript)[1];
      var id = re.exec($scope.rawTranscript)[2];
      return {
        name: name,
        id: id
      };
    };

    $scope.saveClassInfo = function() {
      chrome.storage.local.set({'classList': $scope.classList});
      chrome.storage.local.set({'gpaMSCM': $scope.gpaMSCM});
      chrome.storage.local.set({'gpaCBE': $scope.gpaCBE});
    };

    $scope.restoreSavedData = function() {
      chrome.storage.local.get(["classList", "gpaCBE", "gpaMSCM", "modeMSCM"], function(result) {
        $scope.$apply(function() {
          $scope.classList = result.classList;
          $scope.gpaCBE = result.gpaCBE;
          $scope.gpaMSCM = result.gpaMSCM;
          $scope.modeMSCM = result.modeMSCM;
        });
      });
    };

    $scope.saveMode = function(modeMSCM) {
      chrome.storage.local.set({'modeMSCM': modeMSCM});
    };

  }
]);

function saveNameAndID(name, id) {
  chrome.storage.local.set({'studentName': name});
  chrome.storage.local.set({'studentID': id});
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
  document.getElementById('closeButton').addEventListener('click', minimize);
  document.getElementById('backFilter').addEventListener('click', minimize);
  document.getElementById('printButton').addEventListener('click', printSection);
});


// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // clear everything from the cache to force a refresh
  //chrome.storage.local.clear();

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
