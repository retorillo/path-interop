// Distributed under the MIT license
// Copyright (C) 2016 Retorillo

'use strict';

class PathInterop {
  constructor() {
    this.caseInsensitivePlatforms = [ 'win32' ];
    this.linuxEnvToWindowsEnv = { HOME: 'USERPROFILE' };
    this.windowsEnvToLinuxEnv = { USERPROFILE: 'HOME' };
    this.driveLetterConverter = letter => { return letter + ':' };
  }
  linuxToWindows(path, expand) {
    return replaceLinuxEnv(path, v => {
        var e = this.linuxEnvToWindowsEnv[v] ? this.linuxEnvToWindowsEnv[v] : v;
        return expand ? this.env(e) : `%${e}%`;
      }).replace(/[\/]/g, '\\');
  }
  windowsToLinux(path, expand) {
    return replaceWindowsEnv(path, v => {
        var e = this.windowsEnvToLinuxEnv[v] ? this.windowsEnvToLinuxEnv[v] : v;
        return expand ? this.env(e) : `\${${e}}`;
      }).replace(/\${([_a-z0-9]+)}(?![_a-z0-9])/ig, (m, v)=> { return `$${v}`})
        .replace(/^([a-z]):/i, (m, l) => { return this.driveLetterConverter(l); })
        .replace(/[\\]/g, '/')
        .replace(/^\$(HOME|{HOME})\//, '~/');
  }
  toLinux(path, expand) {
    return this.windowsToLinux(this.linuxToWindows(path), expand);
  }
  toWindows(path, expand) {
    return this.linuxToWindows(this.windowsToLinux(path), expand);
  }
  toSystem(path, expand) {
    if (process.platform === 'win32')
      return this.toWindows(path, expand);
    else
      return this.toLinux(path, expand);
  }
  env(name) {
    if (this.caseInsensitivePlatforms.indexOf(process.platform) !== -1){
      for (let n in process.env) {
        if (name.toLowerCase() === n.toLowerCase())
          return process.env[n];
      }
      return '';
    }
    else {
      return process.env[name] || '';
    }
  }
  clone() {
    var pi = new PathInterop();
    for (var p of [ 'caseInsensitivePlatforms', 'linuxEnvToWindowsEnv', 'windowsEnvToLinuxEnv' ])
      pi[p] = JSON.parse(JSON.stringify(this[p]));
    pi.driveLetterConverter = eval(this.driveLetterConverter.toString());
    return pi;
  }
}
function replaceLinuxEnv(path, cb) {
  return path.replace(/^~\//, () => { return cb('HOME') + '/'; })
    .replace(/\$([_a-z0-9]+)/ig, (m, v)=>{ return cb(v); })
    .replace(/\$\{([_a-z0-9]+)\}/ig, (m, v) => { return cb(v); });
}
function replaceWindowsEnv(path, cb){
  return path.replace(/%([_a-z0-9]+)%/ig, (m, v) => { return cb(v); });
}
module.exports = new PathInterop();
