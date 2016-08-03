/**
 * Created by reamd on 2016/5/31.
 */
(function($){
    var db,
        arrayKey = [],
        openRequest,
        lastCursor,
        indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB,
        dbName = "person1",
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
//执行回调
function dataHandler(tx,rs){//SQL成功后处理方法}// tx为transaction对像，rs 返回的结果数据集对像;
    console.log("transaction executeSql success");
}

function errorHandler(tx,error){//SQL成功后处理方法}// tx为transaction对像，rs 返回的结果数据集对像;
    console.dir("transaction executeSql error:", error.source+":"+error.message);
}

//初始化数据库(存在则打开，不存在则建立)
    function init() {
        db = openDatabase(dbName, "1.0", 'Test db', 10240);
        //存在数据库则打开，不存在则建立数据库(数据库名称，版本号可以不填，对数据库的描述，数据库大小单位kb)
        db.transaction(function (tx, rs) {
            tx.executeSql('create table if not exists ' + tableName + ' (name text, phone text, address text)', [], dataHandler, errorHandler);
            tx.executeSql('select * from ' + tableName, [], function(tx, rs) {
                for (var i = 0; i < rs.rows.length; i++) {
                    render({
                        key: rs.rows[i]['rowid'],
                        name: rs.rows[i]['name'],
                        phone: rs.rows[i]['phone'],
                        address: rs.rows[i]['address']
                    });
                }
            });
        });
    }

//删除数据库
    function deleteDB(){
        db.transaction(function (tx, rs) {
            tx.executeSql('drop database ' + dbName, [], function(tx,rs) {
                $('#content').html('');
            });
        });
    }

//增加某条记录
    function addRecord() {
        var name = $('#name').val(),
            phone = $('#phone').val(),
            address = $('#address').val();
        db.transaction(function (tx, rs) {
            tx.executeSql('insert into ' + tableName + '(name,phone,address) values(?,?,?)',[name, phone ,address], function(tx,rs) {
                console.log('增加数据',rs);
                tx.executeSql('select * from ' + tableName + ' where rowid=?',[rs.insertId], function(tx,rs) {
                    if(rs.rows.length !== 0) {
                        render({
                            key: rs.rows[0]['key'],
                            name: rs.rows[0]['name'],
                            phone: rs.rows[0]['phone'],
                            address: rs.rows[0]['address']
                        });
                    }
                }, errorHandler);
            }, errorHandler);
        });
    }

//删除某条记录
    function deleteRecord(id) {
        db.transaction(function (tx, rs) {
            tx.executeSql('delete from ' + tableName + ' where rowid=?',[parseInt(id)], function(tx, rs) {
                console.log('删除数据：',rs);
                $('#' + id).remove();
            }, errorHandler);
        });
    }

//修改某条记录
    function updateRecord(id) {
        var name = $('.edit0').val(),
            phone = $('.edit1').val(),
            address = $('.edit2').val();
        db.transaction(function (tx, rs) {
            tx.executeSql('update ' + tableName + ' set name=' + name + ',phone=' + phone + ',address='+ address + ' where id=' + id, [], function(tx, rs) {
                updateRender({
                    key: rs.rows[0]['key'],
                    name: rs.rows[0]['name'],
                    phone: rs.rows[0]['phone'],
                    address: rs.rows[0]['address']
                });
            });
        });
    }

//查询记录
    function queryRecords(curName){
        db.transaction(function (tx, rs) {
            tx.executeSql('select * from ' + tableName + ' where name=?', [curName], function(tx, rs) {
                $('#content').html('');
                console.log('开始查询数据结果为：',rs);
                for (var i = 0; i < rs.rows.length; i++) {
                    render({
                        key: rs.rows[i]['rowid'],
                        name: rs.rows[i]['name'],
                        phone: rs.rows[i]['phone'],
                        address: rs.rows[i]['address']
                    });
                }
            }, errorHandler);
        });
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