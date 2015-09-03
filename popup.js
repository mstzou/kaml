chrome.storage.sync.get("statusText",
    function(items) {
        document.getElementById('status').innerHTML = items.statusText;
});
