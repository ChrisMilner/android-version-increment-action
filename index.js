const fs = require('fs');
const core = require('@actions/core');

const ALLOWED_INCREMENT_TYPES = ['major', 'minor', 'patch'];

const VERSION_CODE_REGEX_BY_FORMAT = {
    "groovy": /versionCode ([0-9]+)/,
    "kotlin": /versionCode = ([0-9]+)/,
};
const VERSION_NAME_REGEX_BY_FORMAT = {
    "groovy": /versionName "([0-9]+).([0-9]+).([0-9]+)"/,
    "kotlin": /versionName = "([0-9]+).([0-9]+).([0-9]+)"/,
};

const getNewVersionName = (major, minor, patch, incrementType) => {
    if (incrementType === 'major') {
        return formatVersion(parseInt(major) + 1, 0, 0);
    }

    if (incrementType === 'minor') {
        return formatVersion(major, parseInt(minor) + 1, 0);
    }

    if (incrementType === 'patch') {
        return formatVersion(major, minor, parseInt(patch) + 1);
    }
};

const formatVersion = (major, minor, patch) => `${major}.${minor}.${patch}`;

const getFormatFromFileName = (fileName) => fileName.endsWith('.kts') ? 'kotlin' : 'groovy';

try {
    const pathToBuildFile = core.getInput('build-gradle-path');
    const incrementType = core.getInput('name-increment-type').toLowerCase();

    if (!ALLOWED_INCREMENT_TYPES.includes(incrementType)) {
        core.setFailed('Invalid upgrade type, must be Major, Minor, or Patch (not case-sensitive)')
        return;
    }

    const buildFileContents = fs.readFileSync(pathToBuildFile, { encoding: 'utf8' });

    const fileFormat = getFormatFromFileName(pathToBuildFile);

    console.log(`Detected build file format: ${fileFormat}`);

    const [, code] = VERSION_CODE_REGEX_BY_FORMAT[fileFormat].exec(buildFileContents);
    const [, major, minor, patch] = VERSION_NAME_REGEX_BY_FORMAT[fileFormat].exec(buildFileContents);

    const newCode = parseInt(code) + 1;
    const newName = getNewVersionName(major, minor, patch, incrementType);

    console.log(`Version Code: ${code} => ${newCode}`);
    console.log(`Version Name: ${formatVersion(major, minor, patch)} => ${newName}`);

    const keyValueSeparator = fileFormat == "kotlin" ? " = " : " ";

    const newFileContents = buildFileContents
        .replace(`versionCode${keyValueSeparator}${code}`, `versionCode${keyValueSeparator}${newCode}`)
        .replace(`versionName${keyValueSeparator}"${formatVersion(major, minor, patch)}"`, `versionName${keyValueSeparator}"${newName}"`);

    fs.writeFileSync(pathToBuildFile, newFileContents);

    core.setOutput('new-version-code', newCode);
    core.setOutput('new-version-name', newName);

} catch(error) {
    core.setFailed(error.message);
    throw error;
}
