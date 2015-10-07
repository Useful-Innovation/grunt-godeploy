function getCommands(commands,where,when,prependPath){
    if(!(where in commands && when in commands[where])) return false;
    cmd = commands[where][when]

    // Force array
    Array.isArray(cmd) || (cmd = [cmd])

    // Filter out empty values
    cmd  = cmd.filter(function(e){return e});

    // Build command
    if(cmd.length){
        prependPath && cmd.unshift('cd ' + prependPath)
        cmd = 'sh -c "' + cmd.join('; ') + '"';

        return cmd;
    }

    return false;
}

module.exports = function(grunt) {
    // Load dependencies
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-confirm');

    // Register task
    grunt.task.registerMultiTask('godeploy', 'Deploy to one or more servers with rsync', function(){
        var command, tasks   = [];

        // Merge default, task and target options.
        var options = this.options({
            src:        './',
            commands:   {},
            exclude:    []
        });

        // Get target data
        var target = this.data;

        // Set up SSH options for sshexec
        var ssh = {
            host:       target.host,
            port:       target.port,
            username:   target.user,
            agent:      process.env.SSH_AUTH_SOCK
        }

        // Local before commands
        if((command = getCommands(options.commands,'local','before'))){
            grunt.config.set('exec.commands_local_before',command);
            tasks.push('exec:commands_local_before');
        }

        // Remote before commands
        if((command = getCommands(options.commands,'remote','before',target.dest))){
            grunt.config.set('sshexec.commands_remote_before',{
                command: command,
                options: ssh
            });
            tasks.push('sshexec:commands_remote_before');
        }

        // The rsync
        grunt.config.set('rsync',{
            options: {
                args:       ['-ra','--delete-excluded'],
                exclude:    options.exclude,
                recursive:  true
            },
            deploy: {
                options: {
                    src:    options.src,
                    dest:   target.dest,
                    host:   target.user + '@' + target.host,
                    port:   target.port || 22
                }
            }
        });

        tasks.push('rsync:deploy');

        // Remote after commands
        if((command = getCommands(options.commands,'remote','after',target.dest))){
            grunt.config.set('sshexec.commands_remote_after',{
                command: command,
                options: ssh
            });
            tasks.push('sshexec:commands_remote_after');
        }


        // Local after commands
        if((command = getCommands(options.commands,'local','after'))){
            grunt.config.set('exec.commands_local_after',command);
            tasks.push('exec:commands_local_after');
        }

        // Set up confirmation
        grunt.config.set('confirm.deploy',{
            options: {
                question: 'Are you sure you want to deploy to target "' + this.target + '"? (y/n)',
                input: '_key:y'
            }
        });

        // Add confirmation as first task
        tasks.unshift('confirm:deploy');

        // Run
        // console.log(grunt.config());
        grunt.task.run(tasks);

    });
};
