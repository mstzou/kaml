var setting = {
    isActivated: true,
    frequency: '1',
    statusText: '',
    inTab: false,
    appsflyer_url: 'https://hq.appsflyer.com'
  }; // default
var url_pattern = '*://*.appsflyer.com/*'; // url pattern in tab

// ajax stuff
function refresh() {
    console.info('refreshing.');
    var xhr = new XMLHttpRequest();
    try {
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4){
          return;
        }
        if (xhr.responseText) {
          console.info('refresh success');
          showStatus();
          /*
          // handle response content
          var container = document.implementation.createHTMLDocument().documentElement;
          container.innerHTML = xhr.responseText;
          var info = container.querySelector('.tab-pane#lA');
          */
          return;
        }
      };

      xhr.onerror = function(error) {
        console.error(error);
      };

      xhr.open("GET", setting.appsflyer_url || 'https://hq.appsflyer.com/', true);
      xhr.send(null);
    } catch(e) {
      console.error('reresh error');
      console.error(e);
    }
}

function showStatus(){
  chrome.storage.sync.get(null, function(items) {
    var text = 'Last checking time: ' + (new Date().toLocaleString()) + '<br>'
                       + 'Active: ' + (items.isActivated ? 'Yes' : 'No') + '<br>';
    if(items.inTab){
      console.info('appsflyer is on ' + items.inTab + 'th tab.<br>');
    }
    chrome.browserAction.setIcon({path: items.isActivated ? "on.png" : "off.png"});
    chrome.storage.sync.set({
      statusText: text
    });
  });
}
// ajax stuff
function startRequest(params) {
  chrome.tabs.query({url: url_pattern}, function(tabs){
    var inTab = false;
    if(tabs.length > 0 && tabs[0]){
      inTab = tabs[0].index + 1;
    }
    chrome.storage.sync.set({
      isActivated: inTab !== false,
      inTab: inTab
    }, function(){
      if(inTab === false){
        console.info('deactive');
        showStatus()
        return;
      }
      refresh();
    });
  });
  scheduleRequest();
}

function scheduleRequest() {
  var delay = setting.frequency || 1; // 1 minute
  console.info('schedule request: ' + delay + ' min.') ;
  delay = parseInt(delay);
  chrome.alarms.create('refresh', {periodInMinutes: delay});
}

function onAlarm(alarm) {
  console.info('Got alarm', alarm);
  if (alarm && alarm.name == 'watchdog') {
    onWatchdog();
  } else {
    chrome.storage.sync.get(null, function(items) {
      startRequest();
    });
  }
}

function onWatchdog() {
  chrome.alarms.get('refresh', function(alarm) {
    if (alarm) {
      console.info('Refresh alarm exists. Yay.');
    } else {
      console.info('Refresh alarm doesn\'t exist!? ' +
                  'Refreshing now and rescheduling.');
      startRequest();
    }
  });
}

function run(){
  chrome.storage.sync.set(setting, function() {
    startRequest();
  });
  chrome.alarms.create('watchdog', {periodInMinutes:5});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    setting[key] = changes[key].newValue;
  }
});

chrome.runtime.onInstalled.addListener(run);

chrome.runtime.onStartup.addListener(run);

chrome.alarms.onAlarm.addListener(onAlarm);
