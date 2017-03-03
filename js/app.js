/**
 * Created by jaretburkett on 2/6/17.
 */

const fs = require('fs');
const {dialog} = require('electron').remote;
const remote = require('electron').remote;
const dateFormat = require('dateformat');
var shell = require('electron').shell;
var path = require('path');
storage = require('electron-json-storage');
var moment = require('moment');
var CoinDesk = require("node-coindesk");
var Chart = require('chart.js');

var ctx = document.getElementById("bitcoin-chart");


Chart.defaults.global.animation = {
    duration:0
};
Chart.defaults.global.legend = {
    display:false
};
Chart.defaults.global.title = {
    display:true,
    text:'30 days'
};
Chart.defaults.global.maintainAspectRatio = false;

var bitcoinChart = new Chart(ctx, {
    type: 'line',
    backgroundColor:'rgba(255,255,255,0.3)',
    data: {
        datasets: [{
            label: 'BTC/USD',
            data: [],
            backgroundColor:'rgba(237,160,73,0.6)',
            borderColor:'rgba(237,160,73,1)',
            pointRadius:0
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                position:'bottom',
                time: {
                    displayFormats: {
                        quarter: 'MMM YYYY'
                    }
                }
            }],
            yAxis: [{
                beginAtZero:false,
                position:'top'
            }]
        }
    }
});

var coindesk = new CoinDesk();

// get isdev
var isDev = remote.getGlobal('sharedObject').isDev;
var bitcoinPrice = 0;
var bitcoinHistorical = {};

// config
// update frequency in ms
var updateFrequency = 1000 * 60; // 1 minute

// on load
$(function () {
    updatePrices();
    // set ticker updates
    setInterval(function () {
        updatePrices();
    }, updateFrequency);

});


function updatePrices() {
    getBitcoinPrice();
}

function getBitcoinPrice() {
    coindesk.currentPrice(function (data) {
        data = JSON.parse(data);
        bitcoinPrice = data.bpi.USD.rate_float.toFixed(2);
        console.log(bitcoinPrice);
        $('.bitcoin-price').html(formatNumber(bitcoinPrice));
        $('.price-sub').html(moment().format('MMMM Do YYYY, h:mm a'));
        getBitcoinHistorical();
    });
}

function getBitcoinHistorical() {
    var start_date = new Date();
    var end_date = new Date();
    end_date.setDate(end_date.getDate() - 30);
    coindesk.historical({start_date: start_date, end_date: end_date}, function (data) {
        data = JSON.parse(data);
        bitcoinHistorical = data.bpi;
        console.log(data);

        var newData = [];

        for (var date in bitcoinHistorical) {
            var item = {
                x: date,
                y: bitcoinHistorical[date]
            };
            newData.push(item);
        }
        //update chart
        console.log(newData);
        bitcoinChart.data.datasets[0].data = newData;
        bitcoinChart.update();
        bitcoinChart.resize();

    });
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
