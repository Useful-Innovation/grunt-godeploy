# godeploy
Grunt powered deployment

# Usage

 - Add the following dependency to package.json:
 
   `"godeploy": "git+ssh://git@github.com/Useful-Innovation/godeploy"`

 - Make sure Gruntfile.js is refactored so you have the config in a defined object. Then add the following:
 
   `require('godeploy')(grunt,config);`

 - Create a deploy.json (use example provided in this git)
 
 - Run `grunt deploy`
