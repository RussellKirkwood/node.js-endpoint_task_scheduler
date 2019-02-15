const {app, BrowserWindow} = require('electron')
const {Menu} = require('electron')
const path = require('path')
const url = require('url')
const https = require("https");
const fetch = require("node-fetch");
const apiURL1 = "";
const apiURL2 ="";
const apiURL3 ="";
var endpointhelper = require('./endpointconfighelper.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 800})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.webContents.on('did-finish-load', () => {
    // this starts the execute which will always loop
      executeCallToAPI();
    //win.webContents.send('ping', 'zzzzzwhoooooooh!');
  })

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }  
})
  
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

var apiStatus = "Start APIEndPoint Caller";

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

const ipcMain = require('electron').ipcMain;

// ipcMain.on('asynchronous-message', function(event, arg) {
//   console.log(apiStatus)  ;
  
//   event.sender.send('asynchronous-reply', apiStatus );
//   //event.sender.send('store-data2', 'apiStatus' ); 

//});

//win.webContents.send('ping', 'whoooooooh!');

// ipcMain.on('store-data', function(event, arg) {
//   // console.log(apiStatus)  ;  
//   event.sender.send('store-data2', 'apiStatus' );
// });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// This function does API Call

// This function calls calltoapi and when done calls it again after 10 seconds
function executeCallToAPI(){

  // first read endpoints.json to get endpoints
  var endpointsArray = endpointhelper.accessEndPointsConfigFile();
  console.log('Starting API EndPoint Caller. \r\n');
  console.log('Reading EndPoints.json file for list of endpoints. \r\n' + endpointsArray);

  // Now loop thru Endpoints
  var endpointsList = JSON.parse(endpointsArray);  
  win.webContents.send('endpointsList', endpointsList);

  console.log('Executing API Calls ' );

for(i = 0; i < endpointsList.endpoints.length; i += 1) {

  if (endpointsList.endpoints[i].method == 'post')
  {
    var milliseconds = endpointsList.endpoints[i].milliseconds;
    var url = endpointsList.endpoints[i].url;
    var name = endpointsList.endpoints[i].name;

    //console.log('Calling API ' + name );

    // This runs caller and sets on Timer
  //  setInterval(function(){
  //    postcallToAPI(name, url)
  //  }, milliseconds);   

  //setInterval(postcallToAPI(name, url), milliseconds);   

  var interval = setInterval(function(str1, str2) {
    console.log(str1 + " " + str2);
    postcallToAPI(str1, str2)
  }, milliseconds, name, url);
  
  //clearInterval(interval);
  

  }
  
  }

  

    
  // This runs caller and sets on Timer
  // setInterval(function(){
  //       postcallToAPI()
  //   }, 10000);   
}

function postcallToAPI(name, url) 
{
  console.log('postcallToAPI ' + name + ' ' + url);     
  apiStatus = new Date() + name + ' ' + url + ' Calling Endpoint';   

        // Do first call to API
        fetch(url, {method: "POST"})        
        .then(response => {
          response.json().then(json => {
            //apiStatus = Date() + ' Result: ' + JSON.stringify(json)  ;
            var currentdate = new Date(); 
            win.webContents.send('endpointResults', currentdate + ' ' + name + ' ' + JSON.stringify(json));
            //console.log(apiStatus);
          });
        })
        .catch(error => {
          apiStatus = error;
          //console.log(error);
          var currentdate = new Date(); 
          win.webContents.send('endpointResults', currentdate + ': Error ' + error + name + ' ' + url);
        });  
}




const menuTemplate = [
  {
    label: 'EndPoints Config',
    submenu:
     [
      {
        label: 'View Endpoints Config (endpoints.json)',
        click () 
        {
          win.loadURL(url.format({
            pathname: path.join(__dirname, 'endpoints.json'),
            protocol: 'file:',
            slashes: true
          }))
        }
      },      
      ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  }  
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Edit menu.
  template[1].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'speak'
        },
        {
          role: 'stopspeak'
        }
      ]
    }
  )
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}
