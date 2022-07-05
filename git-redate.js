// require the library, main export is a function
const simpleGit = require('simple-git');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
// node git-redate.js ../customer-data 57caf2404dd913172114e1f823a9ee6bea7b58d3

const getGitUser = async function getGitUser () {
    // Exec output contains both stderr and stdout outputs
    const nameOutput = await exec('git config --global user.name')
    const emailOutput = await exec('git config --global user.email')

    return {
        name: nameOutput.stdout.trim(),
        email: emailOutput.stdout.trim()
    }
};

const cherryPick = async function cherryPick (hash) {
    // Exec output contains both stderr and stdout outputs
    return await exec(`git cherry-pick ${hash}`)
};

const resetDate = async function resetDate () {
    // Exec output contains both stderr and stdout outputs
    return await exec(`git commit --amend --reset-author --no-edit`);
};

console.log('Hello world');
const projectDir = process.argv[2];
const startHash = process.argv[3];
console.log('projectDir', projectDir);

//process.chdir('/tmp');


const git = simpleGit(); // simpleGit('../customer-data');

process.chdir(projectDir);
console.log(git.cwd(projectDir));

// const logOptions = {
//     file: projectDir,
// };

const logOptions = {
    '--first-parent': null,
};

const logCb = async (s, logData) => {
    // console.log('s', s);

    // console.log('logData', logData.all[0]);

    // logData['all']
    // logData['latest']

    const hashes = [];
    let parentHash = null;

    // const allLogs = logData.all;

    let branchName = logData.all[0].refs.split(' ')[2];// refs: 'HEAD -> POL-1838-Salesforce-API',
    let newBranchName = `PR/${branchName}`;

    for (let i = 0; i < logData.all.length; i++) {
        // console.log('i');
        const commit = logData.all[i];
        console.log(commit);
        hashes.push(commit.hash);

        if (commit.hash === startHash) {
            // Get parent commit of this one. Then branch off parent.
            parentHash = logData.all[i + 1].hash;
            break;
        }
    }

    console.log(hashes);
    console.log('parent:', parentHash);
    console.log('branchName:', branchName);
    console.log('newBranchName:', newBranchName);
    // newBranchName

    await git.checkout(['-b', newBranchName, parentHash]);

    // git.command
    // console.log(await getGitUser());

    const reversedHashes = hashes.reverse()

    for (let i = 0; i < reversedHashes.length; i++) {

        /*
        The previous cherry-pick is now empty, possibly due to conflict resolution.
         */
        console.log(await cherryPick(reversedHashes[i]));
        console.log(await resetDate());
    }
}


/*
[
  'd7c63b6c8054e719a636a0327a87a83a78c82924',
  'f8092f2ec214cae091f5a994335b410cea48979e',
  '2b2e85472f987aecd9a8c28a80fafc2e25b2c32e',
  '862de0b38807d83694183a4f0cee1b4a6039c373',
  '5015ebd7f49e47e28b64934e79ef82610e0752e3',
  '09434cad42c77dfe3a5f6d7f63b745086d39cbef',
  'b1dc123466b52b4ea03bcad34f0aa09c957f36c7',
  '43c2787ac22ec7e0ef6df2646e799fbe80bd9ac8',
  '9a7e4263ed15b7b8310f8a2720670f766ead60a5',
  '5673ae857c591f52de10a00ca15e95a733a6d9e3',
  '57caf2404dd913172114e1f823a9ee6bea7b58d3'
]
 */

console.log(git.log(logOptions, logCb));
