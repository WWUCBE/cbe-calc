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

  var classString;
  while (classString = re.exec(transcript)) {
    var course = {
      subject: classString[1],
      crse: classString[2],
      name: classString[3],
      credits: classString[4],
      grade: classString[5],
      gpa: getGPAValue(classString[5]),
      isCBE: false,
      isMSCM: false
    }


    course.isCBE = isCBE(course);
    course.isMSCM = isMSCM(course);
    console.log(course);
  }
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

/* Input: object containing the raw text of the transcript. 
 * Output: list of course objects, as interpreted by CBE rules. */
function parseClassesCBE(info) {
  //console.log("readFromPageCBE()");
  var classList = [];
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
    'K*',
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
    // check if the line has a class listed in the class prefix list
    if(headers.indexOf(lineArray[0]) >= 0){
      var tempName = (lineArray[0] + ' ' + lineArray[1]).substring(0, 8)
      var tempGrade;
      var tempCredits;
      var realGrade = false;
      
      // start at gpa position for course record and loop to end of line
      for(var ind = 5; ind < lineArray.length; ind++){
        if(grades.indexOf(lineArray[ind])>=0){
          tempGrade = lineArray[ind];

          //Class has a '*' after the grade
          if(tempGrade[1] === '*' || tempGrade[2] === '*') {
            //tempGrade = tempGrade.substring(1,tempGrade.length);
            //console.log("K was hit, tempgrade=" + tempGrade);
            break;
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
        for(var j = 0 ; j < classList.length ; j++){
          if(classList[j].name === tempName){
            classList[j].composite = 'composite';
          }
        }

        classList.push({
          name: tempName,
          grade: tempGrade,
          gpa: getGPAValue(tempGrade),
          credits: tempCredits
        });
      }
    }
  }

  return classList;
}

 /* Input: object containing the raw text of the transcript. 
  * Output: list of course objects, as interpreted by MSCM rules. */
function parseClassesMSCM(info) {
  //console.debug("readFromPageMSCM()");
  var classList = [];
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
    'K*',
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
          if(tempGrade[1] === '*' || tempGrade[2] === '*') {
            break;
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
        for(var j = 0 ; j < classList.length ; j++){
          if(classList[j].name === tempName){
            /* Remove duplicates */
            classList.splice(j, 1);
            j--;

          }
        }

        classList.push({
          name: tempName,
          grade: tempGrade,
          gpa: getGPAValue(tempGrade),
          credits: tempCredits
        });
      }
    }
  }

  return classList;
}


/* Input: list of course objects 
 * Output: GPA and total credits for MSCM, as well as 
 *         the original list but modified to mark duplicates */
function calculateMSCMGPA(classList) {
  
  /* detect duplicates */
  for(var i = 0 ; i < classList.length ; i++){ //Remove unecessary "composite" flags
    
    /* don't touch K grade classes */
    if (classList[i].grade === "K" || classList[i].grade === "K*") {
      continue;
    }
    classList[i].composite = "unique";
    for(var j = i+1 ; j < classList.length ; j++){
      if(classList[j].name === classList[i].name){
        classList[i].composite = "composite";
      }
    }
  }

  var gpa = 0.00;
  var credits = 0.00;

  // tally gpa and credits for all classes in classList
  for(var i = 0 ; i < classList.length ; i++){
    if(classList[i].composite === "unique" && classList[i].gpa >= 0){
      gpa += (+classList[i].gpa * +classList[i].credits);
      credits +=  +classList[i].credits;
    }
  }

  if(gpa != 0){
    gpa = gpa / credits;
  }

  var gradeInfo = {
    gpa: gpa.toFixed(2),
    credits: credits,
    classList: classList
  };

  return gradeInfo;
}

/* Input: list of course objects 
 * Output: GPA and total credits for CBE, as well as 
 *         the original list but modified to mark duplicates */
function calculateCBEGPA(classList) {
  var gpa = 0.00;
  var credits = 0.00; 

  //The number of credits minus credits from classes that were retaken
  for(var i = 0 ; i < classList.length ; i++){

    // only calculate info from standard gpa grades
    if(classList[i].gpa >= 0){
      gpa += (+classList[i].gpa * +classList[i].credits);
      credits += +classList[i].credits;
    }
  }

  if(gpa != 0){
    gpa = gpa / credits;
  }

  var gradeInfo = {
    gpa: gpa.toFixed(2),
    credits: credits,
    classList: classList
  };

  return gradeInfo;
}

/* Input: string representing letter grade 
 * Output: floating point equivalent; -1 in cases where
 *         the grade doesn't factor in to the GPA. */
function getGPAValue(letterGrade) {
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
    console.log("Unexpected grade: " + letterGrade);
  }

  return grade.toFixed(1);
}
