// Inform the background page that
// this tab should have a page-action

chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    // Collect the necessary data
    var pageData = ""

    //For students who HAVE applied for graduation
    try{
      pageData = document.getElementsByClassName("pagebodydiv")[0].children[1].innerText;

      if(pageData.includes("Subj")){
        //Add valid text to domInfo
        var domInfo = {
          data: pageData
        }
        // Directly respond to the sender (popup),
        // through the specified callback
        response(domInfo);
        return;
      }
    }catch (e){
      console.log("Caught error from student applied block (content.js)");
    }
    //For advisers
    try{
      pageData = document.getElementsByClassName("pagebodydiv")[0].children[2].innerText;

      if(pageData.includes("Subj")){
        //Add valid text to domInfo
        var domInfo = {
          data: pageData
        }
        // Directly respond to the sender (popup),
        // through the specified callback
        response(domInfo);
        return;
      }
    }catch (f){
      console.log("Caught error from advisor block (content.js)");
    }
    //For students who have NOT applied for graduation
    try{
      pageData = document.getElementsByClassName("pagebodydiv")[0].children[3].innerText;

      if(pageData.includes("Subj")){
        //Add valid text to domInfo
        var domInfo = {
          data: pageData
        }
        // Directly respond to the sender (popup),
        // through the specified callback
        response(domInfo);
        return;
      }
    }catch (g){
      console.log("Caught error from student not applied block (content.js)");
    }

  }
});

function formatForPrint(){
    
    console.log("running improved print function");

    var printWindow = window.open('', 'PRINT', 'height=900,width=700');

    printWindow.document.write('<html><head><link rel="stylesheet" href="../css/print.css" type="text/css" media="all">');
    printWindow.document.write('<html><title>Unofficial GPA</title></head>');
    printWindow.document.write('<img src="../resources/Western-logo-CBE.jpg" alt="WWU CBE logo" width="600"></br>');
    
    
    //Create necessary variables
    var classList = [];
    var mode = 'UNSET';
    var gpa = 0.0;
    var credits = 0;

    //Get mode and store it in variable
	console.log("getting mode");
    chrome.storage.sync.get('mode', function(result){
        //Check if mode has been set
        if(typeof(result.mode) != "undefined"){
            //Set mode variable
            if(result.mode === 'true'){
                mode = 'CBE';
            }else{
                mode = 'MSCM';
            }
            console.debug("Mode: " + mode);
            //Append mode to page
            printWindow.document.write("<body><b> PROGRAM: " + mode);
        }
    });

    //Get gpa
	console.log("Getting GPA");
    chrome.storage.sync.get('gradeInfo', function(result){
        //Check if mode has been set
        if(typeof(result.gradeInfo) != "undefined"){
            //Set mode variable
            console.debug(result.gradeInfo);
            //Append gradeInfo to page
            printWindow.document.write("<b><br/>GPA: " + result.gradeInfo[0]);
            printWindow.document.write("<b><br/>CREDITS: " + result.gradeInfo[1]);
        }

        //Add line
        printWindow.document.write("<br/><br/><br/><hr><b>Classes:</b></br></br>");
    });

    //Get classes and store them in variable
	console.log("getting CBE classes");
    chrome.storage.sync.get('CBEclasses', function(result){
        //Check to see if there are classes saved in storage
		console.log("checking class list");
        if((typeof(result.CBEclasses) != "undefined") 
            && (result.CBEclasses.length > 0)){
            //Set classList variable
			console.log("setting class list");
            classList = result.CBEclasses;
            console.debug(classList);
            //Loop to append each class to page
            for(var i = 0 ; i < classList.length ; i++){
				console.log("adding class");
                printWindow.document.write("<b>" + classList[i].name + "</b><br/>GPA: " + 
                    classList[i].gpa + "<br/>CREDITS: " + classList[i].credits +
                    "<br/><br/>");
            }
          printWindow.document.write( "<hr>");
	  printWindow.document.write('</body></html>');

          printWindow.document.close();
          printWindow.focus();


          //print the output
          setTimeout(function(){printWindow.print();},1000);
          setTimeout(function(){printWindow.close();},1000);
        }
    });

}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    //console.log(sender + message + sendResponse);
    if (message.action == "print"){
        console.log("print message recieved");
      console.debug("Message received");
      formatForPrint();
    }
  }
);
