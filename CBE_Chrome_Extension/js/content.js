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

    pageData = document.children[0].children[1].children[0].children[2].innerText
    if(document.children[0].children[1].children[0].children[3].innerText != "\n\n"){
      pageData = document.children[0].children[1].children[0].children[3].innerText
    }

    var domInfo = {
      data: pageData
    }

    // Directly respond to the sender (popup),
    // through the specified callback */
    response(domInfo);
  }
});
