'use strict';

function init(projectName, cmdObj, program) {
    // program.parent.opts().targetPath
    console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH);
}

module.exports = init;

