'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

function getNpmInfo(npmName, registry) {
    if(!npmName) return null
    registry = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registry, npmName)
    return axios.get(npmInfoUrl).then(response => {
        if (response.status === 200) {
            return response.data;
        }
        return null;
    }).catch(err => {
        return Promise.reject(err);
    });
}

function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if(data) {
        return Object.keys(data.versions)
    }else {
        return []
    }
}

function getNpmSemverVersions(baseVersion, versions) {
    versions = versions
        .filter(version=> semver.satisfies(version, `^${baseVersion}`))
        .sort((a, b) => semver.gt(b, a) ? 1 : -1);
    return versions
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = await getNpmSemverVersions(baseVersion, versions)
    if(newVersions && newVersions.length) {
        return newVersions[0]
    }
}

async function getNpmLatestVersion(npmName, registry) {
    let versions = await getNpmVersions(npmName, registry);
    if (versions) {
        return versions.sort((a, b) => semver.gt(b, a))[0];
    }
    return null;
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion,
    getDefaultRegistry,
    getNpmLatestVersion
};
