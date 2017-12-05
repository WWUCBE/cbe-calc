/* calculator-beckend.js 
 * This file contains all the transcript parsing and
 * and GPA calculation logic. 
 */

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
          gpa: getGPAValue(tempGrade).toFixed(1),
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
            classList[j].composite = 'composite';
          }
        }

        classList.push({
          name: tempName,
          grade: tempGrade,
          gpa: getGPAValue(tempGrade).toFixed(1),
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
  var counter = 0;

  // stores the number of times a class can be taken
  var target = 1;

  /*  detect duplicates */
  for(var i = 0 ; i < classList.length ; i++){ 
    //Remove unecessary "composite" flags
    classList[i].composite = "unique";
    
    counter = 0;
    
    /* allow for certain classes to be retaken for credit */
    if((classList[i].name === "IBUS 474") || (classList[i].name === "MGMT 474")){
      target = 2;
    }else{
      target = 1;
    }

    // mark duplicate classes
    for(var j = i+1 ; j < classList.length ; j++){
      if(classList[j].name === classList[i].name){
        counter++;
        if(counter >= target){
          classList[i].composite = "composite";
        }
      }
    }
  }

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
function getGPAValue(string){
  /* checks if it's a completed K grade */
  var re = /K[A-Z][\-+\++]?/;
  if (re.test(string)) {
    string = string.substring(1,4);
  }

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
  }else if(letter === "K" || string === 'K*'){
    gpa = -1;
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
