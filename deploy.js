module.exports = function(grunt,config,data){
    // console.log(grunt,config.pkg);
    var tasks = [],
        deploy = grunt.file.readJSON(data || 'deploy.json');

    deploy.server.agent = process.env.SSH_AUTH_SOCK;

    config.sshexec = {};
    config.exec = {};

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

    var cwd = process.cwd();
    process.chdir(__dirname);

    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-rsync');

    process.chdir(cwd);

    grunt.registerTask('deploy', 'Deploy project to production server', tasks);
}