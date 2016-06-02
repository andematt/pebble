/**
 * SmartThings control for Pebble
 */

var UI = require('ui');
var ajax = require('ajax');

var baseURL = 'https://graph-na02-useast1.api.smartthings.com';

var options = {'endpointURL':'/api/smartapps/installations/71decb8e-00d2-42c3-b440-d4ebfb1ce311',
               'accessToken': 'ce919bf7-ed5b-4d44-b028-080c0c409870'};

var resultsMenu = new UI.Menu({
  backgroundColor: 'white',
  textColor: 'blue',
  highlightBackgroundColor: 'blue',
  highlightTextColor: 'white'
});

console.log("Options: " + JSON.stringify(options));
console.log("url access " + options.endpointURL);
console.log("token access " + options.accessToken);

var parseItems = function (data, type) {
    var items = [];
    
    for(var i=0; i < data.length; i++) {
        console.log(data[i].label);
        items.push({
            id: data[i].id,
            title: data[i].label,
            subtitle: data[i].value,
            type: type,
            command: "toggle"
        });
        
        if(type == "garageDoors") {
            items.command = "push";
        }
        else {
            items.command = "toggle";
        }
    }
    return items;
};

function getMenu() {
    var switchItems;
    
    ajax(
        {
            url:baseURL + options.endpointURL + '/switches',
            type:"json",
            headers:{'Authorization': 'Bearer ' + options.accessToken}
        },
        function(data) {
            switchItems = parseItems(data, "switches");
            console.log("Switches = " + JSON.stringify(switchItems));
            
            var switchSection = {
                title: "Switches",
                items: switchItems
            };
            
            resultsMenu.section(0, switchSection);
        },
        function(e) {
            console.log("Fail: " + e);
        }
    );
}

resultsMenu.on('select', function(e) {
    console.log("url build: " + options.endpointURL + "/" + e.item.type + "/" + e.item.id + "/" + e.item.command);
    ajax(
        {
            url:baseURL + options.endpointURL + "/" + e.item.type + "/" + e.item.id + "/" + e.item.command,
            method:'GET',
            type:'json',
            headers:{'Authorization': 'Bearer ' + options.accessToken, 'Content-Type': 'application/json'},
        },
        function(data) {
            console.log(e.item.title + ": toggled");
            setTimeout(getMenu(), 1000);
        },
        function(error) {
          if (error) {
            console.log("Fail: " + JSON.stringify(error));
          }
          setTimeout(function() {
            getMenu();
          }, 800);
        }
    );
});

resultsMenu.on('longSelect', function() {
    getMenu();
});

getMenu();
resultsMenu.show();