# path-interop

[![Build Status](https://travis-ci.org/retorillo/path-interop.svg?branch=master)](https://travis-ci.org/retorillo/path-interop)
[![NPM](https://img.shields.io/npm/v/path-interop.svg)](https://www.npmjs.com/package/path-interop)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Provides path format conversion between Windows and Linux including path
seperator conversion and environment variable expansion.

Allows you to add Linux path format interoperability into your Windows/Linux
cross-platform apps.

## Install

```bash
npm install --save path-interop
```

## Usage

```javascript
// Single instance
const PathInterop = require('path-interop');

// When multiple instances are required, use clone()
const interop1 = require('path-interop');
const interop2 = interop1.clone();
```

## Functions

### windowsToLinux(path, expand)

Converts path format from Windows to Linux with/without environment variable
expansion.

Specify `true` for `expand` in order to expand environment variables like `%VAR%`.

Otherwise, variable names are preserved. For example,
`windowsToLinux('%USERPROFILE%/')` will return `'~/'` without expansion.

**NOTE:** Windows Drive letter and colon (`C:`) is not convertible to Linux
format. Therefore, by default it is preserved. For exmaple,
`windowsToLinux('C:\\')` returns `'C:/'`. You can change this behavior by using
[driveLetterConverter](#driveletterconverter) option.

### linuxToWindows(path, expand)

Converts path format from Linux to Windows with/without environment variable
expansion.

Specify `true` for `expand` in order to expand environment variables like `~/`,
`$VAR` or `${VAR}`. 

Otherwise, variable names are preserved. For example, `linuxToWindows('~/')`
will return `'%USERPROFILE%/'` without expansion.

**NOTE:** `~otherUserName/` is unsupported

### toLinux(path, expand)

Forcely converts path format to Linux with/without environment variable expansion.

Equivalent to `windowsToLinux(linuxToWindows(path), expand)`.

### toWindows(path, expand)

Forcely converts path format to Windows with/without environment variable
expansion.

Equivalent to `linuxToWindows(windowsToLinux(path), expand)`.

### toSystem(path, expand)

Forcely converts path format to current platform. If `process.platform` is
`win32` internally calls `toWindows`, otherwise calls `toLinux`.

## Options

### driveLetterConverter

Specify converter function to convert drive letter.

```javascript
// Default value (Preserve)
PathInterop.driveLetterConverter = letter => {
  return letter + ':'
}

// For MSYS2 (C:\ => /c)
PathInterop.driveLetterConverter = letter => {
    return '/' + letter.toLowerCase(); 
}

// Just only remove drive letter and colon
PathInterop.driveLetterConverter = letter => {
  return '';
}
```

### caseInsensitivePlatforms

Array of platform name that store case-insensitive variable name like Windows.
Return values of `process.platform()` are used.

```javascript
// Default value
PathInterop.caseInsensitivePlatforms = [ 'win32' ];

// Custom additional value
PathInterop.caseInsensitivePlatforms.push('futurePlatform');

// Custom value
PathInterop.caseInsensitivePlatforms = [ 'win32', 'futurePlatform' ]
```

### linuxEnvToWindowsEnv

Object that represent conversion table of environment variable name (Linux to
Windows).

```javascript
// Default value
PathInterop.linuxEnvToWindowsEnv.HOME = 'USERPROFILE';

// Custom additonal value
PathInterop.linuxEnvToWindowsEnv.LINUXENV = 'WINENV';

// Custom overwrite
PathInterop.linuxEnvToWindowsEnv = { LINUXENV: 'WINENV' };
```

## windowsEnvToLinuxEnv

Object that represent conversion table of environment variable name (Windows to
Linux).

```javascript
// Default value
PathInterop.windowsEnvToLinuxEnv.USERPROFILE = 'HOME';

// Custom additonal value
PathInterop.windowsEnvToLinuxEnv.WINENV = 'LINUXENV';

// Custom overwrite
PathInterop.windowsEnvToLinuxEnv = { WINENV: 'LINUXENV' };
```

## clone

Creates a new object that is a copy of the current instance.

```javascript
var p1 = require('path-interop');
var p2 = require('path-interop');

console.log(p1 === p2); // True (Because of require-cache)

var p3 = p1.clone();

console.log(p1 === p3); // False
console.log(p1.linuxEnvToWindowsEnv 
  === p3.linuxEnvToWindowsEnv); // False
```

## License

Distributed under the MIT license

Copyright (C) 2016 Retorillo
