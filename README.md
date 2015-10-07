# godeploy
Grunt powered deployment

## Usage

 - Add the following dependency to package.json:
 
   `"godeploy": "git+ssh://git@github.com/Useful-Innovation/godeploy"`

 - Make sure Gruntfile.js is refactored so you have the config in a defined object. Then add the following:
 
   `require('godeploy')(grunt,config);`

 - Create a deploy.json (use example provided in this git)
 
 - Run `grunt deploy` or use `deploy` task in another task.

## deploy.json example
```JSON
{
    "version": 1,
    "server": {
        "host":       "123.123.123.123",
        "port":       "22",
        "username":   "deploy",
        "path":       "/home/deploy/myproject"
    },
    "commands": {
        "remote": {
            "before": "mkdir -p foobar",
            "after":  ""
        },
        "local": {
            "before": "",
            "after":  ""
        }
    },
    "exclude": [
        "node_modules"
    ]
}
```

## Notes

### Commands
 - Commands can be strings or arrays of strings. Remote commands runs in provided path and local commands runs in `./`.