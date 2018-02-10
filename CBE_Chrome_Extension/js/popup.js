/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs) {
    var url = tabs[0].url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(tabs[0]);
  });
}
/*
*
*Update the status text in the popup.html
*
*/
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

/*
*
*Functions to show/hide a div
*
*/
function show(elementID) {
    document.getElementById(elementID).style.display='inline';
}
function hide(elementID) {
    document.getElementById(elementID).style.display='none';
}


/*
*
*Redirects to unofficial transcript
*
*/
window.addEventListener('load', function() {
   var theAnchors = document.getElementsByClassName('wwuRedirect');
   for(i=0, len=theAnchors.length; i<len; i++) {
      theAnchors[i].addEventListener('click', function() {
         chrome.tabs.create({url: "https://admin.wwu.edu/pls/wwis/wwskahst.WWU_ViewTran"});
      }, false);
   }
}, false);

window.addEventListener('load', function() {
   var theAnchors = document.getElementsByClassName('refreshData');
   for(i=0, len=theAnchors.length; i<len; i++) {
      theAnchors[i].addEventListener('click', function() {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function (tabs) {
          // ...and send a request for the DOM info...
          chrome.tabs.sendMessage(
              tabs[0].id,
              {from: 'popup', subject: 'DOMInfo'},
              // ...also specifying a callback to be called
              //    from the receiving end (content script)
              setDOMInfo);
        });

      }, false);
   }
}, false);


//Decide what to do when DOM Content is loaded
document.addEventListener('DOMContentLoaded', function() {
    getCurrentTab(function(tab) {
        if(tab.url=="https://admin.wwu.edu/pls/wwis/wwskahst.WWU_ViewTran"){
            show('applicationView');
            hide('notOnPage');
            show('toggleSwitch');
          chrome.tabs.sendMessage(
              tab.id,
              {from: 'popup', subject: 'DOMInfo'},
              // ...also specifying a callback to be called
              //    from the receiving end (content script)
              setDOMInfo);
        }
        else if(tab.url=="https://admin.wwu.edu/pls/wwis/wwfkfhst.P_FacDispCurrent"){
            show('applicationView');
            hide('notOnPage');
            show('toggleSwitch');
          chrome.tabs.sendMessage(
              tab.id,
              {from: 'popup', subject: 'DOMInfo'},
              // ...also specifying a callback to be called
              //    from the receiving end (content script)
              setDOMInfo);
        }
        //pulls data from any test page starting with 'testPage'
        else if(tab.url.includes("/testpages/")){
            show('applicationView');
            hide('notOnPage');
            show('toggleSwitch');
          chrome.tabs.sendMessage(
              tab.id,
              {from: 'popup', subject: 'DOMInfo'},
              // ...also specifying a callback to be called
              //    from the receiving end (content script)
              setDOMInfo);
        }else{
            show('notOnPage');
            hide('applicationView');
            hide('toggleSwitch');
            hide('toggleDiv');
        };
    });
});

/*
document.getElementById("toggleSwitch").addEventListener('', function() {

});
*/
