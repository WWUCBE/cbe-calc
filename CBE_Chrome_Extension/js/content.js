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
    var pageData = document.getElementsByTagName("pre")[0].innerText;
    
    //Add valid text to domInfo
    var domInfo = {
      data: pageData
    }
    // Directly respond to the sender (popup),
    // through the specified callback
    response(domInfo);
  }
});

function formatForPrint(){
  // get name from chrome storage
  chrome.storage.local.get(['studentName', 'modeMSCM', 'classList', 'gpaCBE', 'gpaMSCM'], 
  function(result){
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
  
    var gradeInfo = (result.modeMSCM ? result.gpaMSCM : result.gpaCBE);
    var mode = (result.modeMSCM ? "MSCM" : "CBE");

    printWindow.document.write('</br><table style="width=60%">');
    printWindow.document.write('<tr><td><b>Name:</b> ');
    printWindow.document.write(result.studentName);
    printWindow.document.write('</td></tr>');
    printWindow.document.write('<tr><td><b>Program:</b> ' + mode + '</td></tr>');
    printWindow.document.write('<tr><td><b>Progam GPA:</b> ' + gradeInfo.gpa + '</td></tr>');
    printWindow.document.write('<tr><td><b>Applicable Credits:</b> ' + gradeInfo.credits + '</td></tr>');
    printWindow.document.write('</table><br/>');

    // setup class table
    printWindow.document.write('<table class="grades" style="width=80%">');
    printWindow.document.write('<tr><th>Class</th><th>Grade</th><th>Credits</th></tr>');
    
    //Loop to append each class to page 
    result.classList.forEach(function(course) {
      /* skip duplicate classes for MSCM */
      if (course.isOldDupe && result.modeMSCM) {
        return;
      }
      
      if (result.modeMSCM && course.isMSCM ||
      !result.modeMSCM && course.isCBE) {
        printWindow.document.write('<tr><td>' + course.name + '</td>');
        printWindow.document.write('<td>' + course.grade  + '</td>');
        printWindow.document.write('<td>' + course.credits + '</td></tr>');
      }
    });
        
    printWindow.document.write( "</table>");
    printWindow.document.write('</body></html>');
    printWindow.document.close();      
    printWindow.focus();
    //print the output; timeouts needed to get it to work
    setTimeout(function(){printWindow.print();},100);    
    setTimeout(function(){printWindow.close();},100);
  });
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.action == "print"){
        console.log("print message recieved");
      console.debug("Message received");
      formatForPrint();
    }
  }
);
