#!/usr/bin/env node

"use strict";

(() => {

    const fs = require("fs");
    const path = require('path');

    const sh = require('./shell-command');

    const package_file = "/package.json";

    const resolve_package_metadata = () => {

        const package_resolvers = [

            () => {
                return process.cwd();
            },

            () => {
                return path.dirname(require.main.filename);
            },

            () => {
                return "..";
            }
        ];

        for (let prix = 0; prix < package_resolvers.length; prix++) {
            let where = package_resolvers[prix]();
            if (fs.existsSync(where + package_file)) {
                return where;
            }
        }

        throw new Error("Could not locate package.json")
    };

    const package_dir = resolve_package_metadata();
    const node_meta = require(package_dir + package_file);

    function write_meta() {

        let __br = git_branch();
        let __n = (!node_meta.build ? 1 : node_meta.build.number + 1);

        node_meta.build = {
            unique: node_meta.name + ":v" + node_meta.version + "-" + __br + "[build:" + __n + "]",
            number: __n,
            timestamp: new Date().toLocaleString(),
            "git-branch": __br,
            "git-user": git_user() + " <" + git_email() + ">",
            "git-version": git_v(),
            "node-version": process.version,
            computer: process.env['COMPUTERNAME'],
            os: process.env['OS'],
            arch: process.env['PROCESSOR_ARCHITECTURE'],
            user: process.env['USERNAME'] || process.env['USER'],
            shell: process.env['SHELL'],
            lang: process.env['LANG'],
            uname: uname()
        };

        const meta_files = {
            temp: package_dir + "/package-new.json",
            backup: package_dir + "/package-back.json",
            node: package_dir + package_file
        };

        if (fs.existsSync(meta_files.backup)) {
            fs.unlinkSync(meta_files.backup);
        }

        fs.writeFile(meta_files.temp, JSON.stringify(node_meta, null, 2), function (err) {
            if (err) {
                console.log("//NBN\\\\ :: Could not write build metadata file:", meta_files.temp);
                return console.log(err);
            } else {
                fs.renameSync(meta_files.node, meta_files.backup);
                fs.renameSync(meta_files.temp, meta_files.node);
                fs.unlinkSync(meta_files.backup);
            }
        });

        console.log("//NBN\\\\ :: Build metadata captured.");
    }

    let uname = command_matcher("uname");
    let git_branch = command_matcher("git", ["branch"], /[*]\s(\w*)/);
    let git_user = command_matcher("git", ["config", "user.name"]);
    let git_email = command_matcher("git", ["config", "user.email"]);
    let git_v = command_matcher("git", ["--version"], /.*([0-9]+\.[0-9]+\.[0-9]+).*/);

    function command_matcher(cmd, args, pattern) {
        return ()=> {
            let out = sh.sync(cmd, args);
            let soutstr = (out.stdout) ? `${out.stdout}` : ((out.stderr) ? `${out.stderr}` : null);

            if (pattern) {
                let lines = soutstr.split('\n');
                for (let idx in lines) {
                    let data = lines[idx];
                    if (data) {
                        let matcher = data.match(pattern);
                        if (matcher.length > 1) {
                            return (matcher[1]);
                        }
                    }
                }
            } else if (soutstr) {
                return (soutstr).trim();
            }
        }
    }

    write_meta();

})();