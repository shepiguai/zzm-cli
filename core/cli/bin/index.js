#! /usr/bin/env node

// let utils = require('@zhouhaha/utils')
// utils()
// console.log('zhouzhemin1');
const importLocal = require('import-local')

if(importLocal(__filename)) {
    require('npmlog').info('cli', '正在使用cli本地版本')
}else {
    require('../lib')(process.argv)
}
