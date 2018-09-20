"use strict";

(()=>{

    const fs = require("fs");
    const path = require('path');

    const sh = require('./shell-command');

    const resolve_package_metadata = ()=>{
        const suffix = "/package.json";

        const package_resolvers = [
            ()=> {
                return path.dirname(require.main.filename);
            },

            ()=> {
                return process.cwd();
            },

            ()=> {
                return "..";
            }
        ];

        for (let prix = 0; prix < package_resolvers.length; prix++) {
            let where = package_resolvers[prix]() + suffix;
            if (fs.existsSync(where)) {
                return require(where);
            }
        }

        throw new Error("Could not locate package.json")
    };

    const node_meta = resolve_package_metadata();

    function write_meta() {
        let build = {
            computer: process.env['COMPUTERNAME'],
            os: process.env['OS'],
            arch: process.env['PROCESSOR_ARCHITECTURE'],
            user: process.env['USERNAME'],
            timestamp: new Date()
        };

        build.number = (!node_meta.build ? 1 : node_meta.build.number + 1);

        node_meta.build = build;

        const meta_files = {
            temp: package_dir + "package-new.json",
            backup: package_dir + "package-back.json",
            node: package_dir + "package.json"
        };

        if (fs.existsSync(meta_files.backup)) {
            fs.rmdirSync(meta_files.backup);
        }

        fs.writeFile(p_a, JSON.stringify(node_meta, null, 2), function(err) {
            if (err) {
                console.log("Could not write build metadata file:", meta_files.temp);
                return console.log(err);
            } else {
                fs.renameSync(meta_files.node, meta_files.backup);
                fs.renameSync(meta_files.temp, meta_files.node);
            }
        });

    }

    function commit() {

    }

    function branch() {
        sh("git", ["branch"]).stderr((data)=>{
            console.log(data);
            let matcher = /^\w*(\*.*)\w*$/.match(data);
            if (matcher.length > 1) {
                console.log("Branch:", matcher[1]);
            }
        });
    }

    branch();

})();