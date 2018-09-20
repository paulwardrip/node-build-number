(()=>{
    "use strict";

    const spawn = require('child_process').spawn;

    function shellco(cmd, args) {
        const handlers = {
            stdout: ()=>{},
            stderr: ()=>{},
            close: ()=>{}
        };

        setTimeout(()=>{
            const runner = spawn(cmd, args);
            runner.stdout.on('data', handlers.stdout);
            runner.stderr.on('data', handlers.stderr);
            runner.on('close', handlers.close);
        },50);

        return {
            stdout: (c)=>{
                handlers.stdout = c;
            },
            stderr: (c)=>{
                handlers.stderr = c;
            },
            close: (c)=>{
                handlers.close = c;
            }
        }
    }

    module.exports = shellco;
})();