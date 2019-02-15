const fs = require('fs-extra');

// 'module.exports' is a node.JS specific feature, it does not work with regular JavaScript
module.exports = 
{
  // This is the function which will be called in the main file, which is server.js
  // The parameters 'name' and 'surname' will be provided inside the function
  // when the function is called in the main file.  
  accessEndPointsConfigFile: function ()
  {
      
    var obj = {
        endpoints: []
     };

     obj.endpoints.push({name: "Test", url: 'https', method: 'post', milliseconds: 1000});

     var json = JSON.stringify(obj);
     var endPointsArray;
    
     //var endPointsArray = new string[];
     var fileName = 'apiendpoints.json';

     if (fs.existsSync(fileName)) {
        // Do something
        endPointsArray = readEndPointsJson(fileName);        
    }
    else
    {
        fs.writeFile(fileName, json, 'utf8');
    }    
       
       return endPointsArray;
  }

};

// Private variables and functions which will not be accessible outside this file
var readEndPointsJson = function (filename) 
{
    
    var filecontents = fs.readFileSync(filename, 'utf8'); 
    return filecontents;
};



