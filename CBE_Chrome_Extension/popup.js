/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs) {
    var url = tabs[0].url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
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
    document.getElementById(elementID).style.display='block';
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

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    if(url=="https://admin.wwu.edu/pls/wwis/wwskahst.WWU_ViewTran"){
      show('onPage');
      hide('notOnPage');
    }else{
      show('notOnPage');
      hide('onPage');
    };
  });
});
