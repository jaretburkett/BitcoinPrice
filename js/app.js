/**
 * Created by jaretburkett on 2/6/17.
 */
const {remote, BrowserWindow, ipcMain, Tray} = require('electron');
const fs = require('fs');
var path = require('path');
var storage = require('electron-json-storage');
var moment = require('moment');


// get isdev
var bitcoinPrice = 0;

// on load
$(function () {
    updatePrices();
    // set ticker updates
    setInterval(function () {
        updatePrices();
    }, 1000);

});


function updatePrices() {
    getBitcoinPrice();
}

function getBitcoinPrice() {
    bitcoinPrice = remote.getGlobal('sharedObject').bitcoinPrice;
    $('.bitcoin-price').html(formatNumber(bitcoinPrice));
    $('.price-sub').html(moment().format('MMMM Do YYYY, h:mm a'));
}

// disable pinch zooming
window.addEventListener('mousewheel', function (e) {
    // zoom
    if (e.ctrlKey) {
        console.log(e);
        e.preventDefault();

    }
});

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
