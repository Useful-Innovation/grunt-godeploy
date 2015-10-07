function formatCommands(cmd,prependPath){
        Array.isArray(cmd) || (cmd = [cmd])
        cmd  = cmd.filter(function(e){return e});

        if(cmd.length){
                prependPath && cmd.unshift('cd ' + prependPath)
                cmd = 'sh -c "' + cmd.join('; ') + '"';

                return cmd;
        }

        return false;
}

module.exports = function(grunt) {
    grunt.task.registerMultiTask('godeploy', 'Deploy to one or more servers with rsync', function(){
        var targets = this.files;
        var options = this.options({
            src: './',
            commands: {
                remote: { before: [], after:  [] },
                local: { before: [], after:  [] }
            },
            exclude: []
        });

        grunt.loadNpmTasks('grunt-ssh');
        grunt.loadNpmTasks('grunt-exec');
        grunt.loadNpmTasks('grunt-rsync');
        grunt.loadNpmTasks('grunt-confirm');

        targets.forEach(function(target){
            var tasks   = [];

            // Set SSH agent that sshexec should use
            target.agent = process.env.SSH_AUTH_SOCK;

            // Local before commands
            if((command = formatCommands(options.commands.local.before))){
                grunt.config.set('exec.commands_local_before',command);
                tasks.push('exec:commands_local_before');
            }

            // Remote before commands
            if((command = formatCommands(options.commands.remote.before))){
                grunt.config.set('sshexec.commands_remote_before',{
                        command: command,
                        options: target
                });
                tasks.push('sshexec:commands_remote_before');
            }

            // The acctual sync
            grunt.config.set('rsync',{
                    options: {
                        args: ['-ra','--delete-excluded'],
                        exclude: options.exclude,
                        recursive: true
                    },
                    deploy: {
                        options: {
                            src: './',
                            dest: target.dest,
                            host: target.username + '@' + target.host,
                            port: target.port || 22
                        }
                    }
            });

            tasks.push('rsync:deploy');

            // Remote after commands
            if((command = formatCommands(options.commands.remote.after,target.dest))){
                grunt.config.set('sshexec.commands_remote_after',{
                    command: command,
                    options: target
                });
                tasks.push('sshexec:commands_remote_after');
            }


            // Local after commands
            if((command = formatCommands(options.commands.local.after,target.dest))){
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
            grunt.task.run(tasks);
        },this);

    });
};
