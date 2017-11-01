var testPagePaths = [
	{path: "testpages/Duplicate Retake after K Grade.html", name: "Duplicate Retake after K Grade"},
	{path: "testpages/Test A(star) & B grade.html", name: "Test A(star) & B grade"},
	{path: "testpages/Test A(star) grade with Retake.html", name: "Test A(star) grade with Retake"},
	{path: "testpages/Test B(star) & A grade.html", name: "Test B(star) & A grade"},
	{path: "testpages/Test B(star) grade with retake.html", name: "Test B(star) grade with retake"},
	{path: "testpages/Test B(star) grade.html", name: "Test B(star) grade"},
	{path: "testpages/Test C(star) grade with Retake.html", name: "Test C(star) grade with Retake"},
	{path: "testpages/Test C(star) grade.html", name: "Test C(star) grade"},
	{path: "testpages/Test D(star) grade with Retake.html", name: "Test D(star) grade with Retake"},
	{path: "testpages/Test D(star) grade.html", name: "Test D(star) grade"},
	{path: "testpages/Test Duplicates.html", name: "Test Duplicates"},
	{path: "testpages/Test Duplicates2.html", name: "Test Duplicates2"},
	{path: "testpages/Test F(star) grade with Retake.html", name: "Test F(star) grade with Retake"},
	{path: "testpages/Test F(star) grade.html", name: "Test F(star) grade"},
	{path: "testpages/Test K.html", name: "Test K"},
	{path: "testpages/Test KA KA-.html", name: "Test KA KA-"},
	{path: "testpages/Test KB KB+.html", name: "Test KB KB+"},
	{path: "testpages/Test KB- KC.html", name: "Test KB- KC"},
	{path: "testpages/Test KC+ KC-.html", name: "Test KC+ KC-"},
	{path: "testpages/Test KD KD+.html", name: "Test KD KD+"},
	{path: "testpages/Test KD- KF.html", name: "Test KD- KF"},
	{path: "testpages/Test KZ Z.html", name: "Test KZ Z"},
	{path: "testpages/testPage Template.html", name: "testPage Template"},
	{path: "testpages/testPage2.html", name: "testPage2"}
	]

var testPages = [];

function calculateGPA() {
	testPages.forEach(function(htmlFile, index) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(htmlFile.html, "text/html");
		var text = doc.getElementsByClassName("pagebodydiv")[0].children[1].innerText;


		var classlist = parseClassesCBE({data:text});
		var gradeInfoCBE = calculateCBEGPA(classlist);
		var gradeInfoMSCM = calculateMSCMGPA(classlist);
		var cbeGPA = gradeInfoCBE.gpa;
		var mscmGPA = gradeInfoMSCM.gpa;
		// console.log(classlist);
		// console.log(htmlFile.name);
		//console.log(gradeInfoCBE.gpa);
		gpas = extractGpa(htmlFile.html);

		/* see if they're correct */
		testPassed = {cbe: false, mscm: false};
		if (gpas[0].toFixed(2) === cbeGPA) {
			testPassed.cbe = true;
		}
		if (typeof gpas[1] === 'undefined') {
			testPassed.mscm = true;
		} else if (gpas[1].toFixed(2) === mscmGPA) {
			testPassed.mscm = true;
		}

		var resultsList = document.getElementById("resultsList");
		var div = document.createElement("div");
		div.className = "result";
		var innerDiv = document.createElement("div");
		innerDiv.className = "success"
		div.appendChild(innerDiv);
		resultsList.appendChild(div);

		if (!testPassed.cbe || !testPassed.mscm) {
			innerDiv.className = "failure";
		}

		var textNode = document.createTextNode(htmlFile.name);
		innerDiv.appendChild(textNode);
		innerDiv.appendChild(document.createElement("br"));
		var words = "CBE is " + cbeGPA + ", should be " + gpas[0].toFixed(2); 
		textNode = document.createTextNode(words);
		innerDiv.appendChild(textNode);
		
		if (typeof gpas[1] !== 'undefined') {
			innerDiv.appendChild(document.createElement("br"));
			var words = "MSCM is " + mscmGPA + ", should be " + gpas[1].toFixed(2); 
			textNode = document.createTextNode(words);
			innerDiv.appendChild(textNode);
		} 

		/* last element processed */
		if (index === testPages.length-1) {
			console.log("done");
		}
	});
}

function loadPage(testFile) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			testPages.push({html: this.responseText, name: testFile.name});
			/* check if we're all done */
			if (testPages.length === testPagePaths.length) {
				testPages.sort();
				calculateGPA();
			}
		}
		else if (this.status = 404) {
			//console.log("404: " + testFile.name);
		}
	};
  xhttp.open("GET", "http://localhost:8000/" + testFile.path, true);
  xhttp.send();
}

testPagePaths.forEach(function(testFile) {
	loadPage(testFile);
});

function extractGpa(html) {
	var lines = html.split("\n", 2).join(" ");
	var tokens = lines.split(" ");
	var gpas = [];
	tokens.forEach(function(token) {
		var x = parseFloat(token);
		if (!isNaN(x)) {
			gpas.push(x);
		}
	});

	return gpas;

}


// <!-- GPA CBE:  2.75 (Average)
//      GPA MSCM: 3.5 (Takes the Highest)-->

