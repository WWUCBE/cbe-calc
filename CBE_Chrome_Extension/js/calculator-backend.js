/* calculator-beckend.js 
 * This file contains all the transcript parsing and
 * and GPA calculation logic. 
 */

/* Input: raw text of the transcript. 
 * Output: list of course objects */
function parseTranscript(transcript) {
  /* this mess pulls out all the important stuff as capture groups. 
   * In order, from 1: Subject, course number, class name, credits, grade.
   * Note that class name will have extra trailing spaces. */ 
  var re = /\n(\w{3,4})\s+(\d+\w+)\s+\d+\s+(.{1,30})\s*(\d+)\s+(K?\w*[+-]?\*?)/g;
  
  /* add every class to classList. At the sime time, check for and mark
   * retaken classes. */
  var classList = [];
  var classString;
  while (classString = re.exec(transcript)) {
    var course = createCourse(classString[1], classString[2], classString[4], classString[5]); 
    classList.push(course);
  }

  setDupeStatus(classList);

  return classList;
}

/* see if the new class is a duplicate, if it is, mark 
 * the old one as such */
function setDupeStatus(classList) {
  /* key will be the same for repeat classes */
  var key = function(course) {
    return course.subject + course.crse;
  }

  /* we're using an object for it's hashmap properties */
  var uniqueClasses = {};

  classList.forEach(function(course) {
    course.isOldDupe = false;
    var oldClass = uniqueClasses[key(course)];
    if (oldClass !== undefined) {
      oldClass.isOldDupe = true;
    } 
    uniqueClasses[key(course)] = course;
  });
}

function createCourse(subj, crse, credits, grade) {
  var course = {
    subject: subj.toUpperCase(),
    crse: crse,
    name: subj.toUpperCase() + " " + crse,
    credits: parseInt(credits),
    grade: grade.toUpperCase(),
    gpa: getGPAValue(grade),
    isCBE: false,
    isMSCM: false,
    isOldDupe: false,
    isValid: {
      course: true,
      name: true,
      grade: true,
      credits: true
    }
  }

  course.isCBE = isCBE(course);
  course.isMSCM = isMSCM(course);

  return course;
}

/* Used to validate added and modified classes.*/
function validateInput(name, grade, credits) {
  /* Create a course object and populate it accordingly */
  var splitName = name.split(" ");
  var course = createCourse(splitName[0], splitName[1], credits, grade);

  /* return a validity object */
  var valid = {
    name: course.isCBE || course.isMSCM,
    grade: course.gpa >= 0,
    credits: course.credits >= 0
  };
  /* if the individial components are valid, then the class is. */
  valid.course = valid.name && valid.grade && valid.credits;
  Object.assign(course.isValid, valid);

  return {validity: valid, newCourse: course};
}

function isCBE(course) {
  var subjects = [
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

  /* index of is the best way to check for membership in list */
  if (subjects.indexOf(course.subject) != -1) {
    return true;
  } else {
    return false;
  }
}

function isMSCM(course) {
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

  if (validclasses.hasOwnProperty(course.subject) &&
      validclasses[course.subject].indexOf(course.crse) != -1) {
    return true;
  } else {
    return false;
  }
}


/* Input: list of course objects 
 * Output: GPA and total credits for MSCM, as well as 
 *         the original list but modified to mark duplicates */
function calculateMSCMGPA(classList) {

    
  var credits = 0;
  var gpa = 0.0;

  /* only count most recent attempt */
  classList.forEach(function(course) {
    if (course.isMSCM && course.isOldDupe === false && course.gpa >= 0) {
      credits += course.credits;
      gpa += course.gpa * course.credits;
    }
  });

  var finalGpa = gpa / credits;
  return {gpa: finalGpa.toFixed(2), credits: credits};
}

/* Input: list of course objects 
 * Output: GPA and total credits for CBE, as well as 
 *         the original list but modified to mark duplicates */
function calculateCBEGPA(classList) {
  var credits = 0;
  var gpa = 0.0;

  classList.forEach(function(course) {
    if (course.isCBE && course.gpa >= 0) {
      credits += course.credits;
      gpa += course.gpa * course.credits;
    }
  });

  var finalGpa = gpa / credits;
  return {gpa: finalGpa.toFixed(2), credits: credits};
}

/* Input: string representing letter grade 
 * Output: floating point equivalent; -1 in cases where
 *         the grade doesn't factor in to the GPA. */
function getGPAValue(letterGrade) {
  letterGrade = letterGrade.toUpperCase();
  var regex = /(K?)([ABCDFZ])([+-]?)(\*?)/;
  var match = regex.exec(letterGrade);

  var grade;

  /* if the match failed, it's something like W or XM and doesn't count */
  if (match == null) {
    grade = -1;
  } 
  /* if there's an asterisk, it doesn't count */
  else if (match[4] != "") {
    grade = -1;
  } 
  /* if there's a K and no letter grade, it doesn't count */
  else if (match[1] != "" && match[2] == "") {
    grade = -1;
  }
  /* if there's a letter grade, get the value associated with it */
  else if (match[2] != "") {
    switch (match[2]) {
      case "A":
        grade = 4;
        break;
     case "B":
        grade = 3;
        break;
      case "C":
        grade = 2;
        break;
      case "D":
        grade = 1;
        break;
      case "Z":
      case "F":
        grade = 0;
        break;
    }

    /* now we factor in the optional plus or minus */
    if (match[3] === "-") {
      grade -= 0.3;
    } else if (match[3] === "+") {
      grade += 0.3;
    }

  }
  /* if it gets here it's something weird that I didn't account for. */
  else {
    grade = -1;
  }

  return grade;
}
