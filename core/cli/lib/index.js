'use strict';
const path = require('path')
const pkg = require('../package.json')
const semver = require('semver')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const rootCheck = require('root-check')
const colors = require('colors/safe')
const constant = require('./const')
const dotenv = require("dotenv");
const commander = require("commander");
const log = require('@zhouhaha/log')
const init = require('@zhouhaha/init')
const exec = require('@zhouhaha/exec')

const program = new commander.Command()

let args, config;

async function core() {
    try {
        await prepare()
        registerCommand()
    }catch (e) {
        log.error(e.message)
    }
}

async function prepare() {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    await checkGlobalUpdate()
}

function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d --debug', '是否开启debug功能', false)
        .option('-tp --targetPath <>', '是否指定本地调试文件路径', '')

    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化任务', false)
        .action(exec)

    program.on('option:debug', function (){
        if(program.opts().debug) {
            process.env.LOG_LEVEL = 'verbose'
        }else {
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
    })

    program.on('option:targetPath', function () {
        process.env.CLI_TARGET_PATH = program.opts().targetPath
    })

    program.on('command:*', function (obj) {
        const availableCommands = program.commands.map(cmd=>cmd.name())
        console.log(colors.red('未知命令 ')+obj.join(','))
        if(availableCommands.length) {
            console.log(colors.green('可用命令') + availableCommands.join(','));
        }
    })

    // if(process.argv.length < 3) {
    //     program.outputHelp()
    //     console.log()
    // }
    program.parse(process.argv)
}

async function checkGlobalUpdate() {
    const currentVersion = pkg.version
    const npmName = pkg.name
    const { getNpmSemverVersion } = require('@zhouhaha/get-npm-info')
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if(lastVersion && semver.gt(lastVersion, currentVersion)) {
        if (lastVersion && semver.gt(lastVersion, currentVersion)) {
            log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
                更新命令： npm install -g ${npmName}`));
        }
    }
}

function checkEnv() {
    const dotenvPath = path.resolve(userHome, '.env')
    if(pathExists(dotenvPath)) {
        config = dotenv.config({
            path: dotenvPath
        })
    }
    createDefaultConfig()
    // log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if(process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    }else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

function checkInputArgs() {
    const minimist = require('minimist')
    args = minimist(process.argv.slice(2))
    checkArgs()
}

function checkArgs() {
    if(args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    }else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

function checkUserHome() {
    if(!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在'))
    }
}

function checkRoot() {
    rootCheck()
    // process.setuid
    // console.log(process.getuid());
}

function checkPkgVersion() {
    log.info('cli', pkg.version)
}

function checkNodeVersion() {
    const currentVersion = process.version
    const lowerNodeVersion = constant.LOWEST_NODE_VERSION
    if(!semver.gte(currentVersion, lowerNodeVersion)) {
        throw new Error(colors.red(`zzmcli需要安装${lowerNodeVersion}以上版本`))
    }
}

module.exports = core;
