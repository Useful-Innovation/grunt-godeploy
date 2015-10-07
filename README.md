# grunt-godeploy
Grunt powered deployment

## Usage

 - Add the following dependency to package.json:

    `"grunt-godeploy": "git+ssh://git@github.com/Useful-Innovation/grunt-godeploy"`

 - Add the following dependency to Gruntfile:

    `grunt.loadNpmTasks('grunt-godeploy');`

 - Configure deploy targets as described below


## config example
```JSON
{
    godeploy: {
        options: { // Options for all deploy targets
            src: './',
            commands: {
                remote: {
                    before: "",
                    after:  [
                        "mkdir -p animals",
                    ]
                },
                local: {
                    before: "",
                    after:  ""
                }
            },
            exclude: [
                "node_modules"
            ]
        },
        production: { // A deploy target
            host:       "123.123.123.123",
            port:       "22",
            username:   "deploy",
            dest:       "/home/deploy/project"
        }
    }
}
```

## Notes

### Commands
 - Commands can be strings or arrays of strings. Remote commands runs in provided destination and local commands runs in `./`.
