const interop = require('../');

var linuxHome = process.env.HOME = '/usr/home/nodeusr'
var windowsHome = process.env.USERPROFILE = 'C:\\Users\\nodeusr'
var computername = process.env.COMPUTERNAME = 'NODE_MACHINE'

var lastAction;
const testSources = [
  // cloning
  {
    desc: 'Instance cloning',
    action: () => {
      var c = interop.clone();
      for (p of ['windowsEnvToLinuxEnv', 'linuxEnvToWindowsEnv',
        'caseInsensitivePlatforms', 'driveLetterConverter']) {
        if(c[p] === interop) return false;
      }
      return c.windowsEnvToLinuxEnv.USERPROFILE === 'HOME'
        && c.linuxEnvToWindowsEnv.HOME === 'USERPROFILE'
        && c.caseInsensitivePlatforms[0] === 'win32'
        && c.driveLetterConverter('C') === 'C:';
    },
    input: [],
    expected: true,
  },
  // windowsToLinux
  {
    action: interop.windowsToLinux, 
    desc: 'Windows => Linux ($VAR)',
    input: ['%USERPROFILE%\\%COMPUTERNAME%\\'],
    expected: '~/$COMPUTERNAME/',
  },
  {
    desc: 'Windows => Linux (${VAR})',
    input: ['%USERPROFILE%\\%COMPUTERNAME%_001'],
    expected: '~/${COMPUTERNAME}_001',
  },
  {
    desc: 'Windows => Linux /w Expansion',
    input: ['%USERPROFILE%\\%COMPUTERNAME%_002/', true],
    expected: `${linuxHome}/${computername}_002/`,
  },

  // linuxToWindows
  {
    action: interop.linuxToWindows,
    desc: 'Linux => Windows ($VAR)',
    input: ['~/$COMPUTERNAME/'],
    expected: '%USERPROFILE%\\%COMPUTERNAME%\\',
  },
  {
    desc: 'Linux => Windows (${VAR})',
    input: ['$HOME/${COMPUTERNAME}_001/'],
    expected: '%USERPROFILE%\\%COMPUTERNAME%_001\\',
  },
  {
    desc: 'Linux => Windows /w Expansion',
    input: ['~/${COMPUTERNAME}_002/', true],
    expected: `${windowsHome}\\${computername}_002\\`,
  },

  // toWindows
  {
    action: interop.toWindows,
    desc: 'Unkown(Linux) => Windows',
    input: ['~/${COMPUTERNAME}_003/'],
    expected: '%USERPROFILE%\\%COMPUTERNAME%_003\\',
  },
  {
    desc: 'Unkown(Linux) => Windows /w Expansion',
    input: ['~/${COMPUTERNAME}_004/', true],
    expected: `${windowsHome}\\${computername}_004\\`,
  },
  {
    desc: 'Unkown(Windows) => Windows',
    input: ['%USERPROFILE%\\%COMPUTERNAME%_005\\'],
    expected: '%USERPROFILE%\\%COMPUTERNAME%_005\\',
  },
  {
    desc: 'Unkown(Windows) => Windows /w Expansion',
    input: ['%USERPROFILE%\\%COMPUTERNAME%_006\\', true],
    expected: `${windowsHome}\\${computername}_006\\`,
  },

  // toLinux
  {
    action: interop.toLinux,
    desc: 'Unkown(Windows) => Linux', 
    input: ['%USERPROFILE%\\%COMPUTERNAME%_003\\'],
    expected: '~/${COMPUTERNAME}_003/',
  },
  {
    desc: 'Unkown(Windows) => Linux /w Expansion',
    input: ['%USERPROFILE%/%COMPUTERNAME%_004/', true],
    expected: `${linuxHome}/${computername}_004/`,
  },
  {
    desc: 'Unkown(Linux) => Linux', 
    input: ['$HOME/${COMPUTERNAME}_005/'],
    expected: '~/${COMPUTERNAME}_005/',
  },
  {
    desc: 'Unkown(Linux) => Linux /w Expansion',
    input: ['$HOME/${COMPUTERNAME}_006/', true],
    expected: `${linuxHome}/${computername}_006/`,
  },


  // toSystem
  {
    action: interop.toSystem,
    desc: process.platform === 'win32'
      ? 'Linux => System(Windows)'
      : 'Windows => System(Linux)',
    input: [ process.platform === 'win32'
      ? '$HOME/${COMPUTERNAME}'
      : '%USERPROFILE%\\%COMPUTERNAME%'
      , true],
    expected: process.platform === 'win32'
      ? `${windowsHome}\\${computername}`
      : `${linuxHome}/${computername}`,
  },

  // Options
  {
    desc: 'Custom Drive Letter Conversion (For MSYS2)',
    action: (input) => { 
      var c = interop.clone();
      c.driveLetterConverter = letter => {
        return '/' + letter.toLowerCase();
      }
      return c.toLinux(input);
    },
    input: ['C:\\msys64\\usr\\bin'],
    expected: '/c/msys64/usr/bin'
  },
  {
    desc: 'Linux => Windows /w Custom environment variables',
    action: (path, method) => {
      var c = interop.clone();
      c.windowsEnvToLinuxEnv = { WINENV: 'LINUXENV' };
      c.linuxEnvToWindowsEnv = { LINUXENV: 'WINENV' };
      return c[method](path);
    },
    input: ['%USERPROFILE%\\%WINENV%', 'windowsToLinux'],
    expected: '$USERPROFILE/$LINUXENV'
  },
  {
    desc: 'Windows => Linux /w Custom environment variables',
    input: ['$HOME/$LINUXENV', 'linuxToWindows'],
    expected: '%HOME%\\%WINENV%'
  }
];

var failing = 0;
for (var src of testSources) {
  var output = (src.action ? lastAction = src.action : lastAction).apply(interop, src.input);
  if (output !== src.expected) {
    console.log(`\x1b[31m[FAILING] ${src.desc}\x1b[0m`);
    failing++;
  }
  else {
    console.log(`\x1b[36m[PASSING] ${src.desc}\x1b[0m`);
  }
  console.log(`  INPUT: ${src.input.length ? src.input : '(none)'}`);
  console.log(`  OUTPUT: ${output}`);
  console.log(`  EXPECTED: ${src.expected}`);
}
process.exit(failing ? 1 : 0);
