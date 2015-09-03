
function save_options() {
  // var isActivated = document.getElementById('isActivated').checked;
  var frequency = document.getElementById('frequency').value;
  var appsflyer_url = document.getElementById('appsflyer_url').value;
  if( !/https?:\/\/.*appsflyer.*/i.test(appsflyer_url)){
    alert('Appsflyer URL incorrect.');
    return;
  }
  chrome.storage.sync.set({
    // isActivated: isActivated,
    frequency: frequency,
    appsflyer_url: appsflyer_url
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1250);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    // isActivated: true,
    frequency: '1',
    appsflyer_url: 'https://hq.appsflyer.com'
  }, function(items) {
    // document.getElementById('isActivated').checked = items.isActivated;
    document.getElementById('frequency').value = items.frequency;
    document.getElementById('appsflyer_url').value = items.appsflyer_url;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);