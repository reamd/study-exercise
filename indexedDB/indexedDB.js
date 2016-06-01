/**
 * Created by reamd on 2016/5/31.
 */
(function($){
    var db,
        arrayKey = [],
        openRequest,
        lastCursor,
        indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB,
        dbName = "person",
        tableName = "testTable";

/*UI层业务*/
// render方法
    function render(obj) {
        var str = '<tr id="' +
                    obj.key +
                    '"><td>' +
                    obj.name +
                 '</td><td>' +
                    obj.phone +
                 '</td><td>' +
                    obj.address +
                 '</td><td><button class="editRecord">编辑</button>' +
                '<button class="delRecord">删除</button></td></tr>';
        $('#content').append(str);
    }

//可编辑化
    function editRender(id) {
        var $td = $('#' + id).children('td'),
            tempVal,
            str;
        $td.each(function(idx, item) {
            tempVal = $(item).text();
            str = '<input class="edit' + idx + '" value="' + tempVal + '"/>';
            if(($td.length-1) === idx) {
                $(item).find('.editRecord').text('更新').prop('class', 'updateRecord');
            }else {
                $(item).html(str);
            }
        });
    }
    function updateRender(obj) {
        var str = '<td>' +
            obj.name +
            '</td><td>' +
            obj.phone +
            '</td><td>' +
            obj.address +
            '</td><td><button class="editRecord">编辑</button>' +
            '<button class="delRecord">删除</button></td>';
        $('#' + obj.id).html(str);
    }

/*数据业务*/
//数据库事务处理
    function transactionDeal(obj) {
        var transaction = obj.db.transaction([obj.tableName], "readwrite");
        transaction.oncomplete = function (e) {
            console.log("transaction done success");
        };
        transaction.onerror = function (e) {
            console.dir("transaction error:" ,e);
        };
        return transaction.objectStore(obj.tableName);//得到数据库中的表
    }

//初始化数据库
    function init() {
        openRequest = indexedDB.open(dbName); //存在数据库则打开，不存在则建立数据库

        //新的数据库创建和版本库被修改调用函数
        openRequest.onupgradeneeded = function (e) {
            console.log("running onupgradeneeded");
            var thisDB = e.target.result, //获取数据库
                objectStore;
            console.log("DB version is ", thisDB.version); //数据库版本
            if (!thisDB.objectStoreNames.contains(tableName)) { //判断当前数据库中是否存在表tableName
                console.log("I need to create the objectStore ", tableName);
                objectStore = thisDB.createObjectStore(tableName, {keyPath: 'id', autoIncrement: true}); //创建表tableName，并指定主键
                objectStore.createIndex('name', 'name', {unique: false}); //创建索引
            }
        };
        openRequest.onsuccess = function (e) {
            db = e.target.result;
            console.log("DB version is ", db.version);
            db.onerror = function (event) {
                console.dir("error:",event.target.errorCode);
            };
            if (db.objectStoreNames.contains(tableName)) {
                console.log('tables:', tableName);
                var objectStore = transactionDeal({db: db,tableName: tableName});
                var  requestCursor = objectStore.openCursor();
                requestCursor.onsuccess = function (e) {//使用游标遍历
                    var cursor = e.target.result;
                    if (cursor) {
                        console.log("cursor.key:",cursor.key);
                        console.log("cursor.value:",cursor.value);
                        render({
                            key: cursor.key,
                            name: cursor.value['name'],
                            phone: cursor.value['phone'],
                            address: cursor.value['address']
                        });
                        lastCursor = cursor.key;
                        cursor.continue();
                    } else {
                        console.log('cursor is end');
                    }

                };
                requestCursor.onerror = function (e) {
                    console.dir("cursor error:" ,e);
                }
            }
        };
        openRequest.onerror = function (e) {
            console.dir("open DB error:", e);
        };

    }

//删除数据库
    function deleteDB(){
        var deleteDB = indexedDB.deleteDatabase(dbName);
        $('#content').html('');
        deleteDB.onsuccess = function(e) {
            console.log('delete DB success');
        };
        deleteDB.onerror = function(e) {
            console.dir("delete DB error:", e);
        };
    }

//增加某条记录
    function addRecord() {
        var name = $('#name').val(),
            phone = $('#phone').val(),
            address = $('#address').val(),
            person = {
                name: name,
                phone: phone,
                address: address
            };

        var objectStore = transactionDeal({db: db,tableName: tableName});
        objectStore.add(person);
        objectStore.openCursor().onsuccess = function(e) {
            var cursor = e.target.result;
            if(lastCursor == null) {
                lastCursor = cursor.key;
            }else {
                ++lastCursor;
            }
            render({
                key: lastCursor,
                name: name,
                phone: phone,
                address: address
            });
        };
    }

//删除某条记录
    function deleteRecord(id) {
        var objectStore = transactionDeal({db: db,tableName: tableName}),
            removeKey = parseInt(id);
        var delRequest = objectStore.delete(removeKey);
        delRequest.onsuccess = function(e) {
            console.log('delete record success');
            //移除要删除的元素
            $('#' + removeKey).remove();
        };
        delRequest.onerror = function(e) {
            console.dir('delete record error:', e);
        };
    }

//修改某条记录
    function updateRecord(id) {
        var name = $('.edit0').val(),
            phone = $('.edit1').val(),
            address = $('.edit2').val();

        var objectStore = transactionDeal({db: db,tableName: tableName});
        var getRequest = objectStore.get(parseInt(id));
        getRequest.onsuccess = function(e) {
            var person = e.target.result;
            person.name = name;
            person.phone = phone;
            person.address = address;
            objectStore.put(person);
            updateRender(person);
        };
        getRequest.onerror = function(e) {
          console.dir('getRequest error:', e);
        };
    }

//查询记录
    function queryRecords(curName){
        var objectStore = transactionDeal({db: db,tableName: tableName}),
            boundKeyRange = IDBKeyRange.only(curName), //生成一个表示范围的Range对象
            queryRequest = objectStore.index('name').openCursor(boundKeyRange);

        queryRequest.onsuccess = function(e) {
            var cursor = e.target.result;
            if(!cursor) {return;}
            var rowData = cursor.value;
            console.dir('query records:', rowData);
            $('#content').html('');

            render({
                key: cursor.key,
                name: cursor.value['name'],
                phone: cursor.value['phone'],
                address: cursor.value['address']
            });
            cursor.continue();
        };
        queryRequest.onerror = function(e) {
            console.dir("query error:",e);
        }
    }

$(function(){
    init();
    $('#deleteDB').on('click', deleteDB);
    $('#addRecord').on('click', addRecord);
    $('#queryRecords').on('click', function() {
        queryRecords($('#keyWord').val());
    });
    $('body').on('click', '.delRecord', function(){
        var $this = $(this);
        deleteRecord($this.parents('tr').attr('id'));
    });
    $('body').on('click', '.editRecord', function(){
        var $this = $(this);
        editRender($this.parents('tr').attr('id'));
    });
    $('body').on('click', '.updateRecord', function(){
        var $this = $(this);
        updateRecord($this.parents('tr').attr('id'));
    });
});
}(jQuery));