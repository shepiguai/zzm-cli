'use strict';

const path = require('path')

function formatPath(p) {
    if(p && typeof p === 'string') {
        const { sep } = path
        if (sep === '/') {
            return p;
        } else {
            return p.replace(/\\/g, '/');
        }
    }
    return p
}
module.exports = formatPath;
