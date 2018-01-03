// Inform the background page that
// this tab should have a page-action

chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// Listen for messages from the popup
/* "response" is the function setDOMInfo from angular.js */
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    // Collect the necessary data
    var pageData = "";

    //For students who HAVE applied for graduation
    try{
      pageData = document.getElementsByTagName("pre")[0].innerText;

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
      pageData = document.getElementsByTagName("pre")[0].innerText;

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
      pageData = document.getElementsByTagName("pre")[0].innerText;

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

  var printWindow = window.open('', 'PRINT', 'height=800,width=700');

  // Setup the title and header for the print document
  printWindow.document.write('<html><head>')
  printWindow.document.write('<title>Unofficial GPA</title></head><body>');
 
  //Attach style sheet
  var link = document.createElement("link");
  link.href = chrome.extension.getURL("css/print.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  printWindow.document.getElementsByTagName("head")[0].appendChild(link);

  //add cbe logo 
  var imgURL = chrome.extension.getURL("resources/Western-logo-CBE.jpg"); 
  printWindow.document.write('<body><img id="cbe_logo" alt="WWU CBE logo" width="600"><br/>');
  printWindow.document.getElementById("cbe_logo").src = imgURL;

    
  //Create necessary variables
  var classList = [];
  var mode = 'UNSET';
  var gpa = 0.0;
  var credits = 0;
  var name = 'UNSET';


  // get name from chrome storage
  chrome.storage.sync.get('studentName', function(result){
    name = result.studentName;
    //console.log('name: ' + name); 
  });

  //Get mode and store it in variable
  //console.log("getting mode");
  chrome.storage.sync.get('mode', function(result){
  //Check if mode has been set
    if(typeof(result.mode) != "undefined"){
      //Set mode variable
      if(result.mode === 'true'){
        mode = 'CBE';
      }else{
        mode = 'MSCM';
      }
      //console.debug("Mode: " + mode);
    }
  });

  // Get gpa
  console.log("Getting GPA");
  chrome.storage.sync.get('gradeInfo', function(result){

    //console.log(result.gradeInfo);
    //Check if mode has been set
    if(typeof(result.gradeInfo) != "undefined"){
      //console.log("adding header info");

      //Append mode  and title to print page
      //printWindow.document.write("<h1>Academic History</h1>");
      
      printWindow.document.write('</br><table style="width=60%">');
      printWindow.document.write('<tr><td><b>Name:</b> ');
      printWindow.document.write(name);
      printWindow.document.write('</td></tr>');
      printWindow.document.write('<tr><td><b>Program:</b> ' + mode + '</td></tr>');
      printWindow.document.write('<tr><td><b>Progam GPA:</b> ' + result.gradeInfo[0] + '</td></tr>');
      printWindow.document.write('<tr><td><b>Applicable Credits:</b> ' + result.gradeInfo[1] + '</td></tr>');
      printWindow.document.write('</table><br/>');
    }


  });

  //Get classes and store them in variable
  //console.log("getting CBE classes");
  chrome.storage.sync.get('CBEclasses', function(result){
    //Check to see if there are classes saved in storage
    //console.log("checking class list");

    // add classes to page if there are any to add
    if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){
    
      //Set classList variable
      //console.log("setting class list");
      classList = result.CBEclasses;
      //console.debug(classList);

      // setup class table
      printWindow.document.write('<table class="grades" style="width=80%">');
      printWindow.document.write('<tr><th>Class</th><th>Grade</th><th>Credits</th></tr>');
      
      console.log(classList[1]);
      //Loop to append each class to page 
      for(var i = 0 ; i < classList.length ; i++){
        /* skip duplicate classes for MSCM */
        if (classList[i].composite === "composite" && mode == "MSCM") {
          continue;
        }
        
        //find the letter for the gpa of a give class
        var grade = classList[i].gpa;
        var gpa = grade.substring(0,3);
        var gpa_letter = "";

        switch(gpa){
            case("4.0"):
                gpa_letter = "A";
                break;
            case("3.7"):
                gpa_letter = "A-";
                break;
            case("3.3"):
                gpa_letter = "B+";
                break;
            case("3.0"):
                gpa_letter = "B";
                break;
            case("2.7"):
                gpa_letter = "B-";
                break;
            case("2.3"):
                gpa_letter = "C+";
                break;
            case("2.0"):
                gpa_letter = "C";
                break;
            case("1.7"):
                gpa_letter = "C-";
                break;
            case("1.3"):
                gpa_letter = "D+";
                break;
            case("1.0"):
                gpa_letter = "D";
                break;
            case("0.0"):
                gpa_letter = "F";
                break;
            case("-1."):
                gpa_letter = "K";
                break;
            default:
                gpa_letter = "N/A";
                console.log(gpa);
        }
          
        //console.log("adding class");
        printWindow.document.write('<tr><td>' + classList[i].name + '</td>');

        //printWindow.document.write('<td>' + classList[i].gpa + '</td>'); 
        printWindow.document.write('<td>' + gpa_letter + '</td>');
          
        printWindow.document.write('<td>' + classList[i].credits + '</td></tr>');
      }
          

      printWindow.document.write( "</table>");
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
