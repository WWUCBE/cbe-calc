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
          if (course.isMSCM & !course.isOldDupe) {
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

    /* Called when the extension is opened. The variable "page" is what it
     * gets passed from the content script. */
    $scope.initialize = function(page){
      /* saves the rawText, to be used when clicking the refresh button */
      $scope.rawTranscript = page.data;
      
      var student = $scope.getNameAndID();
      /* Uses the student ID to see if it should load the saved class list */
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
      
      if (v.validity.grade && v.validity.credits) {
        v.newCourse.userAdded = true;
        $scope.classList.push(v.newCourse);
        setDupeStatus($scope.classList);
        $scope.recalculateGPA();
        $scope.saveClassInfo();

        /* reset the fields (remember, these are linked with
         * the  html) */
        $scope.name = '';
        $scope.grade = '';
        $scope.credits = ''; 
        $scope.validInput.pristine = true;
      } else {
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

    /* called by every function that affects the classList */
    $scope.recalculateGPA = function() {
      $scope.gpaCBE = calculateCBEGPA($scope.classList);
      $scope.gpaMSCM = calculateMSCMGPA($scope.classList);

      $scope.gpaCBE.badStanding = $scope.gpaCBE.gpa < 2.3;
      $scope.gpaMSCM.badStanding = $scope.gpaMSCM.gpa < 3.0;
    };

    /* triggered by clicking the X button by a class in the UI */
    $scope.removeClass = function(item) {
      var index = $scope.classList.indexOf(item);
      $scope.classList.splice(index, 1);

      setDupeStatus($scope.classList);
      $scope.recalculateGPA();
      $scope.saveClassInfo();
    };

    /* triggered by the refresh button, and called by initialize if
      * a new ID is seen */
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

    /* returns the name and ID of the student */
    $scope.getNameAndID = function() {
      var re = /Name:(.*) ID: (.*) Previous/;
      var name = re.exec($scope.rawTranscript)[1];
      var id = re.exec($scope.rawTranscript)[2];
      return {
        name: name,
        id: id
      };
    };

    /* Saves the classList and both GPAs */
    $scope.saveClassInfo = function() {
      chrome.storage.local.set({'classList': $scope.classList});
      chrome.storage.local.set({'gpaMSCM': $scope.gpaMSCM});
      chrome.storage.local.set({'gpaCBE': $scope.gpaCBE});
    };

    /* restores all relevent info. Called from intialize if a returning
     * user is detected. */
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

    /* saves the mode (mscm or cbe). Triggered by clicking the switch button.*/
    $scope.saveMode = function(modeMSCM) {
      chrome.storage.local.set({'modeMSCM': modeMSCM});
    };

  }
]);

/* saves the student name and ID */
function saveNameAndID(name, id) {
  chrome.storage.local.set({'studentName': name});
  chrome.storage.local.set({'studentID': id});
}

/* this is the function passed as a callback to content.js. */
function setDOMInfo(info) {
  var scope = angular.element(document.getElementById("main")).scope();
  scope.initialize(info);
}

function minimize(e) {
  document.getElementById('toggle').checked = false;
}

function printSection(e) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "print"}, function(response) {
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('closeButton').addEventListener('click', minimize);
  document.getElementById('backFilter').addEventListener('click', minimize);
  document.getElementById('printButton').addEventListener('click', printSection);
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
