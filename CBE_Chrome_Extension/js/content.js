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
    if(document.children[0].children[1].children[2].children[1].innerText != "\n\n"){
      pageData += document.children[0].children[1].children[2].children[1].innerText
    }

    //For advisers
    else if(document.children[0].children[1].children[0].children[2].innerText != "\n\n"){
      pageData += document.children[0].children[1].children[0].children[2].innerText
    }

    //For students who have NOT applied for graduation
    else if(document.children[0].children[1].children[0].children[3].innerText != "\n\n"){
      pageData += document.children[0].children[1].children[0].children[3].innerText
    }

    //Add valid text to domInfo
    var domInfo = {
      data: pageData
    }

    // Directly respond to the sender (popup),
    // through the specified callback */
    response(domInfo);
  }
});

function formatForPrint(){
  //Alert console that print format has been attempted
  //alert("Message received");
  console.log("Attempted to format");

  //Erase page
  document.body.innerHTML = '<br/><br/><br/><br/><br/><br/>';

  //Append grade info to page (TEST)
  var printDiv = document.createElement('printDiv');
  printDiv.innerHTML = '';

  //Create necessary variables
  var classList = [];
  var mode = 'UNSET';
  var gpa = 0.0;
  var credits = 0;

  //Get mode and store it in variable
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
      printDiv.innerHTML += "<b> PROGRAM: " + mode;
    }
  });

  //Get gpa
  chrome.storage.sync.get('gradeInfo', function(result){
    //Check if mode has been set
    if(typeof(result.gradeInfo) != "undefined"){
      //Set mode variable
      console.debug(result.gradeInfo);
      //Append gradeInfo to page
      printDiv.innerHTML += "<b><br/>GPA: " + result.gradeInfo[0];
      printDiv.innerHTML += "<b><br/>CREDITS: " + result.gradeInfo[1];
    }

    //Add line
    printDiv.innerHTML += "<br/><br/><br/><hr><b>Classes:</b></br></br>";
  });

  //Get classes and store them in variable
  chrome.storage.sync.get('CBEclasses', function(result){
    //Check to see if there are classes saved in storage
    if((typeof(result.CBEclasses) != "undefined") && (result.CBEclasses.length > 0)){
      //Set classList variable
      classList = result.CBEclasses;
      console.debug(classList);
      //Loop to append each class to page
      for(var i = 0 ; i < classList.length ; i++){
        printDiv.innerHTML += "<b>" + classList[i].name + "</b><br/>GPA: " + classList[i].gpa + "<br/>CREDITS: " + classList[i].credits + "<br/><br/>";
      }
      printDiv.innerHTML += "<hr>";
    }
  });

  //Add new div to page
  document.body.appendChild(printDiv);
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (message.action == "print"){
      console.debug("Message received");
      formatForPrint();
    }
  }
);
