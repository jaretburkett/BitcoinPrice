var remote = require('electron').remote;

$(function(){
    $('.close-link').click(function(){
        var window = remote.getCurrentWindow();
        window.close();
    });
});