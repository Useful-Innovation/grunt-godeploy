function normalizeData(deploy){

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

    with (deploy.commands){
        remote.before   = formatCommands(remote.before,deploy.server.path);
        remote.after    = formatCommands(remote.after,deploy.server.path);
        local.before    = formatCommands(local.before);
        local.after     = formatCommands(local.after);
    }

    return deploy;
}

module.exports = function(grunt,config,configFile){
    var tasks = [],
        deploy = grunt.file.readJSON(configFile || 'deploy.json');

    deploy.server.agent = process.env.SSH_AUTH_SOCK;

    deploy = normalizeData(deploy);

    'sshexec'   in config || (config.sshexec = {});
    'exec'      in config || (config.exec = {});
    'confirm'   in config || (config.confirm = {});

    if(deploy.commands.local.before.length){
        config.exec.commands_local_before = deploy.commands.local.before;

        tasks.push('exec:commands_local_before');
    }

    if(deploy.commands.remote.before.length){
        config.sshexec.commands_remote_before = {
            command: deploy.commands.remote.before,
            options: deploy.server
        };

        tasks.push('sshexec:commands_remote_before');
    };

    config.rsync = {
        options: {
            args: ['-ra','--delete-excluded'],
            exclude: deploy.exclude,
            recursive: true
        },
        deploy: {
            options: {
                src: './',
                dest: deploy.server.path,
                host: deploy.server.username + '@' + deploy.server.host,
                port: deploy.server.port
            }
        }
    };

    tasks.push('rsync:deploy');

    if(deploy.commands.remote.after.length){
        config.sshexec.commands_remote_after = {
            command: deploy.commands.remote.after,
            options: deploy.server
        }

        tasks.push('sshexec:commands_remote_after');
    }

    if(deploy.commands.local.after.length){
        config.exec.commands_local_after = deploy.commands.local.after;

        tasks.push('exec:commands_local_after');
    }

    config.confirm.deploy = {
        options: {
            question: 'Are you sure you want to deploy to remote server? (y/n)',
            input: '_key:y'
        }
    }

    tasks.unshift('confirm:deploy');

    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-confirm');

    grunt.registerTask('godeploy', 'Deploy project to production server', tasks);
}
