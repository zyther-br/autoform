chrome.runtime.onMessage.addListener((msg)=>{
  if(msg.openPopup){
    chrome.action.openPopup();
  }
});