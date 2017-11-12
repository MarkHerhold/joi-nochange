'use strict';

const MIN_VERSION = 6;

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function f(params) {
    const versionsStr = (await exec('npm view joi versions --json')).stdout;
    let versions = JSON.parse(versionsStr);

    versions = versions.filter(d => +d.split('.')[0] >= MIN_VERSION);

    const compatList = [];
    for (let v of versions) {
        await exec('npm install joi@' + v);

        try {
            const { stdout, stderr } = await exec('npm t');

            compatList.push({
                compat: true,
                version: v,
                stderr,
                stdout
            });
        } catch (error) {
            compatList.push({
                compat: false,
                version: v,
                stderr: error.stderr,
                stdout: error.stdout,
                error
            });
        }


    }

    // log out the results
    console.log('Compatible versions:');
    console.log(compatList.filter(d => d.compat).map(d => d.version).join(', '));

    console.log();

    console.log('Incompatible versions:');
    console.log(compatList.filter(d => !d.compat).map(d => d.version).join(', '));
}

try {
    f();
} catch (error) {
    console.error(error);
}
