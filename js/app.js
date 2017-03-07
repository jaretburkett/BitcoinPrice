/**
 * Created by jaretburkett on 2/6/17.
 */
const {remote, BrowserWindow, ipcMain, Tray} = require('electron');
const fs = require('fs');
var path = require('path');
var storage = require('electron-json-storage');
var moment = require('moment');
var Chart = require('chart.js');
var showMenu = remote.require('./main').showMenu;

var ctx = document.getElementById("bitcoin-chart");


Chart.defaults.global.animation = {
    duration: 0
};
Chart.defaults.global.legend = {
    display: false
};
Chart.defaults.global.maintainAspectRatio = false;
var bitcoinChart = new Chart(ctx, {
    type: 'line',
    backgroundColor: 'rgba(255,255,255,0.3)',
    data: {
        datasets: [{
            label: 'BTC/USD',
            lineTension: 0,
            data: [],
            backgroundColor: 'rgba(237,160,73,0.6)',
            borderColor: 'rgba(237,160,73,1)',
            pointRadius: 0,
        }]
    },
    options: {
        animation: false,
        tooltips: {
            backgroundColor: 'rgba(77,77,77,1)',
            enabled: true,
            mode: 'nearest',
            intersect: false,
            titleFontFamily: 'Ubuntu',
            bodyFontFamily: 'Ubuntu',
            displayColors: false,
            bodyFontColor: '#ccc',
            titleFontColor: '#eda049',
            xPadding: 20,
            caretSize: 10,
            callbacks: {
                // tooltipItem is an object containing some information about the item that this label is for (item that will show in tooltip).
                // data : the chart data item containing all of the datasets
                label: function (tooltipItem, data) {
                    console.log('Label-tooltipItem', tooltipItem);
                    console.log('Label-data', data);
                    return moment(tooltipItem.xLabel).format('MMM Do, YYYY');
                    // Return string from this function. You know the datasetIndex and the data index from the tooltip item. You could compute the percentage here and attach it to the string.
                },
                title:function (tooltipItem, data) {
                    console.log('Title-tooltipItem', tooltipItem);
                    console.log('Title-data', data);
                    return '$'+formatNumber(parseFloat(tooltipItem[0].yLabel).toFixed(2));

                    // Return string from this function. You know the datasetIndex and the data index from the tooltip item. You could compute the percentage here and attach it to the string.
                }
            }
        },
        scales: {
            yAxes: [{
                display: false
            }],
            xAxes: [{
                type: 'time',
                position: 'bottom',
                time: {
                    displayFormats: {
                        quarter: 'MMM YYYY'
                    }
                },
                display: false
            }]
        }
    }
});

// get isdev
var bitcoinPrice = 0;

// on load
$(function () {
    updatePrices();
    // set ticker updates
    setInterval(function () {
        updatePrices();
    }, 1000);


    $('.quit-app').click(function(){
        var window = remote.getCurrentWindow();
        window.close();
    })
    $('.settings').click(function(){
        showMenu(false);
    })
});


function updatePrices() {
    getBitcoinPrice();
    drawGraph();
}

function getBitcoinPrice() {
    bitcoinPrice = remote.getGlobal('sharedObject').bitcoinPrice;
    $('.bitcoin-price').html(formatNumber(bitcoinPrice));
    $('.price-sub').html(moment().format('MMMM Do YYYY, h:mm a'));
}

function drawGraph() {
    var newData = [];
    for (var date in remote.getGlobal('sharedObject').bitcoinHistorical) {
        var item = {
            x: date,
            y: remote.getGlobal('sharedObject').bitcoinHistorical[date].toFixed(2)
        };
        newData.push(item);
    }
    //update chart
    // console.log(newData);
    bitcoinChart.data.datasets[0].data = newData;
    bitcoinChart.update();
    bitcoinChart.resize();
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
