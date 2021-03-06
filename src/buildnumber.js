#!/usr/bin/env node

"use strict";

(() => {

    const fs = require("fs");
    const path = require('path');

    const sh = require('./shell-command');
    const commander = require("commander");

    const nbn_meta = require("../package.json");

    const package_file = "/package.json";

    commander.version(nbn_meta.version)
        .option("--auto-commit")
        .option("--major")
        .option("--minor")
        .option("--rev")
        .parse(process.argv);

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

        throw new Error("NBN !! Could not locate package.json")
    };

    function write_meta(pathToPackageJson) {

        const uname = command_matcher("uname");
        const git_branch = command_matcher("git", ["branch"], /[*]\s(\w*)/);
        const git_user = command_matcher("git", ["config", "user.name"]);
        const git_email = command_matcher("git", ["config", "user.email"]);
        const git_v = command_matcher("git", ["--version"], /.*([0-9]+\.[0-9]+\.[0-9]+).*/);

        const package_dir = pathToPackageJson || resolve_package_metadata();
        const node_meta = require(package_dir + package_file);


        const git_pull = command_log("git", ["pull"]);
        const git_push = com_respond("git", ["push"], (e, stderr, stdout) => {
            if (/Username/.test(stderr)) {
                console.log("NBN !! Git prompted for info:\n", stderr, "\n****");
                throw new Error("Git authentication not setup, complete a git push from the console in: " + package_dir);
            }
        });

        let vspl = node_meta.version.split(".");
        if (commander.major) {
            node_meta.version = `${parseInt(vspl[0])+1}.0.0`;
            node_meta.build = undefined;
        } else if (commander.minor) {
            node_meta.version = `${vspl[0]}.${parseInt(vspl[1])+1}.0`;
            node_meta.build = undefined;
        } else if (commander.rev) {
            node_meta.version = `${vspl[0]}.${vspl[1]}.${parseInt(vspl[2])+1}`;
            node_meta.build = undefined;
        }

        const __br = git_branch();
        const __n = (!node_meta.build ? 1 : node_meta.build.number + 1);

        node_meta.build = {
            unique: node_meta.name + ":v" + node_meta.version + (()=> {
                if (typeof __br !== 'undefined')
                    return "-" + __br;
                else
                    return "";
            })() + "[build:" + __n + "]",
            number: __n,
            timestamp: new Date().toLocaleString(),
            "git-branch": __br,
            "git-user": (()=>{
                let guser = git_user(), gemail = git_email();
                if (typeof guser !== 'undefined' && typeof gemail !== 'undefined') return guser + " <" + gemail + ">"
            })(),
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

        if (commander.autoCommit) {
            git_pull();
        }
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



                console.log("//NBN\\\\ :: Build metadata updated:", node_meta.build.unique);

                if (commander.autoCommit) {
                    const git_c = command_log("git", ["commit", "-m", "nbn metadata: " + node_meta.build.unique + ""]);

                    git_c();
                    git_pull();
                    git_push();
                }
            }
        });
    }

    function command_log(cmd, args) {
        return()=> {
            sh.sync(cmd, args);
        }
    }

    function com_respond(cmd, args, f) {
return function() {
    let res = sh.sync(cmd, args);

    f(res.error, res.stderr.data, res.stdout.data)
}
    }

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
                        if (matcher && matcher.length > 1) {
                            return (matcher[1]);
                        }
                    }
                }
            } else if (soutstr) {
                return (soutstr).trim();
            }
        }
    }

    if (require.main === module) {
        write_meta();
    } else {
        module.exports = {
            writeMetadata: write_meta
        }
    }
})();