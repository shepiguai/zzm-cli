'use strict';
const path = require('path')
const Package = require('@zhouhaha/package')
const log = require('@zhouhaha/log')

const SETTINGS = {
    // init: '@zhouhaha/init'
    init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    let storeDir = ''
    let pkg
    log.verbose('targetPath', targetPath)
    log.verbose('homePath', homePath)
    const cmdObj = arguments[arguments.length -1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    // const packageVersion = '1.1.0'
    if(!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath);
        log.verbose('storeDir', storeDir);
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if(await pkg.exists()) {
            await pkg.update()
        }else {
            await pkg.install()
        }
    }else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
    }
    const rootFile = pkg.getRootFilePath()
    console.log(rootFile);
    if(rootFile) {
        require(rootFile).apply(null, arguments)
    }
}

module.exports = exec;
