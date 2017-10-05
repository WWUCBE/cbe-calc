var testPagePaths = [
	"testpages/Duplicate Retake after K Grade.html",
	"testpages/Test A(star) & B grade.html",
	"testpages/Test A(star) grade with Retake.html",
	"testpages/Test B(star) & A grade.html",
	"testpages/Test B(star) grade with retake.html",
	"testpages/Test B(star) grade.html",
	"testpages/Test C(star) grade with Retake.html",
	"testpages/Test C(star) grade.html",
	"testpages/Test D(star) grade with Retake.html",
	"testpages/Test D(star) grade.html",
	"testpages/Test Duplicates.html",
	"testpages/Test Duplicates2.html",
	"testpages/Test F(star) grade with Retake.html",
	"testpages/Test F(star) grade.html",
	"testpages/Test K.html",
	"testpages/Test KA KA-.html",
	"testpages/Test KB KB+.html",
	"testpages/Test KB- KC.html",
	"testpages/Test KC+ KC-.html",
	"testpages/Test KD KD+.html",
	"testpages/Test KD- KF.html",
	"testpages/Test KZ Z.html",
	"testpages/testPage Template.html",
	"testpages/testPage2.html",]

var testPages = [];

function calculateGPA() {
	testPages.forEach(function(htmlString, index) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(htmlString, "text/html");
		var text = doc.getElementsByClassName("pagebodydiv")[0].children[1].innerText;
		
		var classlist = parseClassesCBE({data:text});
		var gradeinfo = calculateCBEGPA(classlist);
		//console.log(classlist);
		console.log(gradeinfo.gpa);
		

		/* last element processed */
		if (index === testPages.length-1) {
			console.log("done");
		}
	});
}



function loadPage(path) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			testPages.push(this.responseText);
			/* check if we're all done */
			if (testPages.length === testPagePaths.length) {
				calculateGPA();
			}
		}
	};
  xhttp.open("GET", "http://localhost:8000/" + path, true);
  xhttp.send();
}

testPagePaths.forEach(function(path) {
	loadPage(path);
});

