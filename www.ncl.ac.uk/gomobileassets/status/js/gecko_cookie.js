var saveUTMtoCookie = function() {
    var parts = location.href.substring(location.href.indexOf('?') + 1).split('&');
    var data = {};
    if (parts.length > 0) {
        for (var i = 0; i < parts.length; i++) {
            data[parts[i].split('=')[0]] = parts[i].split('=')[1];
        }
        for (var key in data) {
            if (window.localStorage) {
                localStorage.setItem(key, data[key]);
            } else {
                document.cookie = key + '=' + data[key] + ';max-age=86400;path=/';
            }
        }
    }
    
}
window.addEventListener('load', saveUTMtoCookie);