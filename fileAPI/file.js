/**
 * Created by reamd on 2016/6/6.
 */
//库文件说明：预览，拖放，上传 html5 file API

$('#fileTest').on('change', function(e) {
    var files = e.target.files,
        type = '',
        reader = new FileReader,
        URL = window.URL || window.webkitURL,
        url = URL.createObjectURL(files[0]),
        imgFlag = /image/.test(files[0].type);

    console.dir('文件信息：', files[0]);

    //检测浏览器是否支持
    if(!url) {
        $('#preview').html('你的浏览器不支持HTML5 file API');
        return;
    }

    if(imgFlag) {
        $('#preview').html('<img src="' + url + '"/>');

    }else {
        $('#preview').html('不是合法图片');
    }

    if(imgFlag) {
        reader.readAsDataURL(files[0]);
        type = 'image';
    }else {
        reader.readAsText(files[0]);
        type = 'text';
    }
    reader.onerror = function() {
        console.log('error:' + reader.errorCode)
    };
    reader.onprogress = function(e) {
        console.log(e.loaded + '/' + e.total);
    };
    reader.onload = function() {
        switch (type) {
            case 'image':
                console.log('image:', reader.result);
                break;
            case 'text':
                console.log('text:', reader.result);
                break;
            default:
                break;
        }
    };
});