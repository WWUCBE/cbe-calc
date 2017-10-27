if (typeof kotlin === 'undefined') {
  throw new Error("Error loading module 'cbe-backend'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'cbe-backend'.");
}
this['cbe-backend'] = function (_, Kotlin) {
  'use strict';
  var HashMap_init = Kotlin.kotlin.collections.HashMap_init_q3lmfv$;
  var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_ww73n8$;
  var contains = Kotlin.kotlin.collections.contains_mjy6jw$;
  var contains_0 = Kotlin.kotlin.text.contains_sgbm27$;
  var lazy = Kotlin.kotlin.lazy_klfg04$;
  var Regex = Kotlin.kotlin.text.Regex_61zpoe$;
  var toInt = Kotlin.kotlin.text.toInt_pdl1vz$;
  var toIntOrNull = Kotlin.kotlin.text.toIntOrNull_pdl1vz$;
  var IntRange = Kotlin.kotlin.ranges.IntRange;
  var slice = Kotlin.kotlin.collections.slice_6bjbi1$;
  var joinToString = Kotlin.kotlin.collections.joinToString_fmv235$;
  function getCBEGPA(courses) {
    var tmp$;
    var totalCredits = 0;
    var totalPoints = 0.0;
    tmp$ = courses.iterator();
    while (tmp$.hasNext()) {
      var tmp$_0 = tmp$.next();
      var grade = tmp$_0.component2()
      , subject = tmp$_0.component3()
      , credits = tmp$_0.component5();
      var courseGrade = letterToNumber(grade);
      if (courseGrade >= 0) {
        totalCredits = totalCredits + credits | 0;
        totalPoints += courseGrade * credits;
      }
    }
    var gpa = totalPoints / totalCredits;
    return gpa;
  }
  function getMSCMGPA$GradeInfo(credits, grade) {
    this.credits = credits;
    this.grade = grade;
  }
  getMSCMGPA$GradeInfo.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: 'GradeInfo',
    interfaces: []
  };
  getMSCMGPA$GradeInfo.prototype.component1 = function () {
    return this.credits;
  };
  getMSCMGPA$GradeInfo.prototype.component2 = function () {
    return this.grade;
  };
  getMSCMGPA$GradeInfo.prototype.copy_24o109$ = function (credits, grade) {
    return new getMSCMGPA$GradeInfo(credits === void 0 ? this.credits : credits, grade === void 0 ? this.grade : grade);
  };
  getMSCMGPA$GradeInfo.prototype.toString = function () {
    return 'GradeInfo(credits=' + Kotlin.toString(this.credits) + (', grade=' + Kotlin.toString(this.grade)) + ')';
  };
  getMSCMGPA$GradeInfo.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.credits) | 0;
    result = result * 31 + Kotlin.hashCode(this.grade) | 0;
    return result;
  };
  getMSCMGPA$GradeInfo.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.credits, other.credits) && Kotlin.equals(this.grade, other.grade)))));
  };
  function getMSCMGPA(courses) {
    var tmp$, tmp$_0;
    var uniqueClasses = HashMap_init();
    tmp$ = courses.iterator();
    while (tmp$.hasNext()) {
      var c = tmp$.next();
      var courseGrade = letterToNumber(c.grade);
      if (courseGrade >= 0) {
        uniqueClasses.put_xwzc9p$(c.name, new getMSCMGPA$GradeInfo(c.credits, courseGrade));
      }
    }
    var totalCredits = 0;
    var totalPoints = 0.0;
    tmp$_0 = uniqueClasses.entries.iterator();
    while (tmp$_0.hasNext()) {
      var tmp$_1 = tmp$_0.next();
      var name = tmp$_1.key;
      var gradeInfo = tmp$_1.value;
      totalCredits = totalCredits + gradeInfo.credits | 0;
      totalPoints += gradeInfo.grade * gradeInfo.credits;
    }
    var gpa = totalPoints / totalCredits;
    return gpa;
  }
  function filterCourses(courses, mode) {
    var tmp$, tmp$_0;
    var filteredList = ArrayList_init();
    if (Kotlin.equals(mode, Constants_getInstance().CBE)) {
      tmp$ = courses.iterator();
      while (tmp$.hasNext()) {
        var c = tmp$.next();
        if (contains(Constants_getInstance().CBEAllowedSubjects, c.subject)) {
          filteredList.add_11rb$(c);
        }
      }
    }
     else if (Kotlin.equals(mode, Constants_getInstance().MSCM)) {
      tmp$_0 = courses.iterator();
      while (tmp$_0.hasNext()) {
        var c_0 = tmp$_0.next();
        if (Constants_getInstance().MSCMAllowedCourses.keys.contains_11rb$(c_0.subject)) {
          var subjects = Constants_getInstance().MSCMAllowedCourses.get_11rb$(c_0.subject);
          if (contains(subjects != null ? subjects : Kotlin.throwNPE(), c_0.courseNum)) {
            filteredList.add_11rb$(c_0);
          }
        }
      }
    }
    return filteredList;
  }
  function letterToNumber(letterGradeOriginal) {
    var numberGrade = 0.0;
    var letter;
    var modifier = 32;
    var letterGrade = letterGradeOriginal + '  ';
    if (letterGrade.charCodeAt(0) === 75 && letterGrade.charCodeAt(1) === 32) {
      letter = 75;
      modifier = 32;
    }
     else if (letterGrade.charCodeAt(0) === 75) {
      letter = letterGrade.charCodeAt(1);
      modifier = letterGrade.charCodeAt(2);
    }
     else {
      letter = letterGrade.charCodeAt(0);
      modifier = letterGrade.charCodeAt(1);
    }
    if (contains_0(letterGrade, 42)) {
      letter = 42;
    }
    if (letter === 65) {
      numberGrade = 4.0;
    }
     else if (letter === 66) {
      numberGrade = 3.0;
    }
     else if (letter === 67) {
      numberGrade = 2.0;
    }
     else if (letter === 68) {
      numberGrade = 1.0;
    }
     else if (letter === 70) {
      numberGrade = 0.0;
    }
     else if (letter === 90) {
      numberGrade = 0.0;
    }
     else {
      numberGrade = -1.0;
    }
    if (modifier === 43 && numberGrade < 4) {
      numberGrade += 0.3;
    }
     else if (modifier === 45) {
      numberGrade -= 0.3;
    }
    return numberGrade;
  }
  function Constants() {
    Constants_instance = this;
    this.CBE = 'cbe';
    this.MSCM = 'mscm';
    this.CBEAllowedSubjects = ['ECON', 'ACCT', 'DSCI', 'MIS', 'FIN', 'MKTG', 'OPS', 'MGMT', 'IBUS', 'HRM'];
    this.MSCMAllowedCourses_gst5y3$_0 = lazy(Constants$MSCMAllowedCourses$lambda);
  }
  Object.defineProperty(Constants.prototype, 'MSCMAllowedCourses', {
    get: function () {
      var $receiver = this.MSCMAllowedCourses_gst5y3$_0;
      new Kotlin.PropertyMetadata('MSCMAllowedCourses');
      return $receiver.value;
    }
  });
  function Constants$MSCMAllowedCourses$lambda() {
    var allowedCourses = HashMap_init();
    allowedCourses.put_xwzc9p$('MATH', [157]);
    allowedCourses.put_xwzc9p$('DSCI', [205]);
    allowedCourses.put_xwzc9p$('ACCT', [240, 245]);
    allowedCourses.put_xwzc9p$('ECON', [206, 207]);
    allowedCourses.put_xwzc9p$('MIS', [220]);
    allowedCourses.put_xwzc9p$('MGMT', [271]);
    allowedCourses.put_xwzc9p$('PHYS', [114]);
    allowedCourses.put_xwzc9p$('CHEM', [121]);
    return allowedCourses;
  }
  Constants.$metadata$ = {
    kind: Kotlin.Kind.OBJECT,
    simpleName: 'Constants',
    interfaces: []
  };
  var Constants_instance = null;
  function Constants_getInstance() {
    if (Constants_instance === null) {
      new Constants();
    }
    return Constants_instance;
  }
  function Course(name, grade, subject, courseNum, credits, userAdded) {
    this.name = name;
    this.grade = grade;
    this.subject = subject;
    this.courseNum = courseNum;
    this.credits = credits;
    this.userAdded = userAdded;
  }
  Course.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: 'Course',
    interfaces: []
  };
  Course.prototype.component1 = function () {
    return this.name;
  };
  Course.prototype.component2 = function () {
    return this.grade;
  };
  Course.prototype.component3 = function () {
    return this.subject;
  };
  Course.prototype.component4 = function () {
    return this.courseNum;
  };
  Course.prototype.component5 = function () {
    return this.credits;
  };
  Course.prototype.component6 = function () {
    return this.userAdded;
  };
  Course.prototype.copy_gabw85$ = function (name, grade, subject, courseNum, credits, userAdded) {
    return new Course(name === void 0 ? this.name : name, grade === void 0 ? this.grade : grade, subject === void 0 ? this.subject : subject, courseNum === void 0 ? this.courseNum : courseNum, credits === void 0 ? this.credits : credits, userAdded === void 0 ? this.userAdded : userAdded);
  };
  Course.prototype.toString = function () {
    return 'Course(name=' + Kotlin.toString(this.name) + (', grade=' + Kotlin.toString(this.grade)) + (', subject=' + Kotlin.toString(this.subject)) + (', courseNum=' + Kotlin.toString(this.courseNum)) + (', credits=' + Kotlin.toString(this.credits)) + (', userAdded=' + Kotlin.toString(this.userAdded)) + ')';
  };
  Course.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.name) | 0;
    result = result * 31 + Kotlin.hashCode(this.grade) | 0;
    result = result * 31 + Kotlin.hashCode(this.subject) | 0;
    result = result * 31 + Kotlin.hashCode(this.courseNum) | 0;
    result = result * 31 + Kotlin.hashCode(this.credits) | 0;
    result = result * 31 + Kotlin.hashCode(this.userAdded) | 0;
    return result;
  };
  Course.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.name, other.name) && Kotlin.equals(this.grade, other.grade) && Kotlin.equals(this.subject, other.subject) && Kotlin.equals(this.courseNum, other.courseNum) && Kotlin.equals(this.credits, other.credits) && Kotlin.equals(this.userAdded, other.userAdded)))));
  };
  function getRawClassList(text) {
    var tmp$;
    var classesLines = ArrayList_init();
    var regex = Regex('\n');
    var limit;
    if (limit === void 0)
      limit = 0;
    var lines = regex.split_905azu$(text, limit);
    var regex_0 = Regex('^\\w{3,4}\\s+[0-9]');
    tmp$ = lines.iterator();
    while (tmp$.hasNext()) {
      var line = tmp$.next();
      if (regex_0.containsMatchIn_6bul2c$(line)) {
        classesLines.add_11rb$(line);
      }
    }
    return classesLines;
  }
  function createCourseObjects(rawClassList) {
    var tmp$;
    var courseList = ArrayList_init();
    var offset_crse = 5;
    var offset_name = 17;
    var offset_credits = 48;
    var offset_grade = 52;
    var regex = Regex('\\s+');
    tmp$ = rawClassList.iterator();
    while (tmp$.hasNext()) {
      var course = tmp$.next();
      var limit;
      if (limit === void 0)
        limit = 0;
      var splitLine = regex.split_905azu$(course, limit);
      var subject = splitLine.get_za3lpa$(0);
      var crse = toInt(splitLine.get_za3lpa$(1));
      var creditPos = 3;
      var word = splitLine.get_za3lpa$(creditPos);
      while (!(typeof toIntOrNull(word) === 'number')) {
        creditPos = creditPos + 1 | 0;
        word = splitLine.get_za3lpa$(creditPos);
      }
      var name = joinToString(slice(splitLine, new IntRange(3, creditPos)), ' ');
      var credits = toInt(word);
      var grade = splitLine.get_za3lpa$(creditPos + 1 | 0);
      var courseObject = new Course(name, grade, subject, crse, credits, false);
      courseList.add_11rb$(courseObject);
    }
    return courseList;
  }
  _.getCBEGPA = getCBEGPA;
  _.getMSCMGPA = getMSCMGPA;
  _.filterCourses_hdkk66$ = filterCourses;
  Object.defineProperty(_, 'Constants', {
    get: Constants_getInstance
  });
  _.Course = Course;
  _.getRawClassList = getRawClassList;
  _.createCourseObjects = createCourseObjects;
  Kotlin.defineModule('cbe-backend', _);
  return _;
}(typeof this['cbe-backend'] === 'undefined' ? {} : this['cbe-backend'], kotlin);
