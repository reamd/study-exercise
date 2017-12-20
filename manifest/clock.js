/**
 * Created by reamd on 2017/12/20.
 */
(function () {

    function ajax(data, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open(data.method, data.url, data.aysnc);
        xhr.onload = function (res) {
            if(xhr.status === 200 || xhr.status === 304 || xhr.status === 206) {
                cb(null, JSON.parse(xhr.response));
            }
        };
        xhr.onerror = function (err) {
            cb(err);
        };
        xhr.send(null);
    }

    function validCache() {
        if(navigator.onLine) {
            console.log('[Info] 发送版本请求校验!');
            var data = {
                method: 'GET',
                url: 'http://localhost:3000/getVersion',
                aysnc: true
            };
            ajax(data, function (err, res) {
                if(!err) {
                    var v = localStorage.getItem('version');
                    if(v === res.version) {
                        console.log('[Info] 缓存未失效!')
                    }else {
                        localStorage.setItem('version', res.version);
                        console.log('[Info] 缓存失效, 执行更新!');
                        window.applicationCache.update();
                    }
                }
            });
        }
    }

    function init() {
        // validCache();

        setTimeout(function () {
            document.getElementById('clock').value = new Date();
        }, 0);

        window.addEventListener('online', function () {
            console.log('用户在线!');
            // validCache();
        });
        window.addEventListener('offline', function () {
            console.log('用户离线!');
        });
    }

    init();

})();
