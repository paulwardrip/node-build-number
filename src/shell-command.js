(()=>{
    "use strict";

    const spawn = require('child_process').spawn;
    const spawnSync = require('child_process').spawnSync;

    function async_spawn(cmd, args) {

        const handlers = {
            stdout: (data)=>{ console.log("stdout:", data)},
            stderr: (data)=>{ console.log("stderr:", data)},
            close: (data)=>{ console.log("end [exit code:", data, "]")}
        };

        function step(command, argarray) {
            setTimeout(() => {
                const stringley = (h)=>{
                    return (d)=> {
                        h(`${d}`);
                    }
                };

                const runner = spawn(command, argarray);
                runner.stdout.on('data', stringley(handlers.stdout));
                runner.stderr.on('data', stringley(handlers.stderr));
                runner.on('close', stringley(handlers.close));
            }, 50);
        }

        step(cmd, args);

        let __api;
        return __api = {
            stdout: (c)=>{
                handlers.stdout = c;
                return __api;
            },
            stderr: (c)=>{
                handlers.stderr = c;
                return __api;
            },
            close: (c)=>{
                handlers.close = c;
                return __api;
            },
            step: step
        }
    }

    function sync_spawn(cmd, args) {
        return spawnSync(cmd, args);
    }

    module.exports = {
        async: async_spawn,
        sync: sync_spawn
    };
})();