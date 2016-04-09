/*global chrome:false, document:false, console:false*/
(function (window) {
  'use strict';
  var isOn = {};
  function setIconState(tabId) {
    var icon;
    if (isOn[tabId]) {
      icon = 'icon128.png';
    } else {
      icon = 'iconoff128.png';
    }
    chrome.browserAction.setIcon({
      tabId: tabId,
      path: icon
    });
  }
  function setContentScriptIsOn(tabId) {
    chrome.tabs.sendMessage(tabId,
      {
        op: 'switch',
        value: isOn[tabId]
      });
  }
  function setCurrentTabIcon(toggle) {
    chrome.tabs.query({active: true,
        lastFocusedWindow: true
    },function (tabs){
      var tab = tabs[0];
      if (toggle) {
        isOn[tab.id] = !isOn[tab.id];
      }
      setContentScriptIsOn(tab.id);
      setIconState(tab.id);
    });
  }
  function onChange() {

    setCurrentTabIcon(true);
  }
  chrome.browserAction.onClicked.addListener(function (tab) {
    onChange();
  });

  chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      setContentScriptIsOn(tabId);
      setIconState(tabId);


      chrome.storage.sync.get({
        color: '#cc0000',
        radius: 20,
        duration: 500,
        ripplecount: 2,
        transition: 'quad-out'
      }, function (items) {
        chrome.tabs.sendMessage(tabId, {
          op: 'options',
          value: items
        });
      });
    }
  });
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    setContentScriptIsOn(activeInfo.tabId);
  });
}(this));
