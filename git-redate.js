// require the library, main export is a function
const simpleGit = require('simple-git');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const getGitUser = async function getGitUser () {
    // Exec output contains both stderr and stdout outputs
    const nameOutput = await exec('git config --global user.name')
    const emailOutput = await exec('git config --global user.email')

    return {
        name: nameOutput.stdout.trim(),
        email: emailOutput.stdout.trim()
    }
};

const execCommand = async function cherryPick (cmd) {
    // Exec output contains both stderr and stdout outputs
    return await exec(cmd);
};

const cherryPick = async function cherryPick (hash) {
    // Exec output contains both stderr and stdout outputs
    return await exec(`git cherry-pick ${hash} -m 1`)
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
        try {
            const cherryPickRes = await cherryPick(reversedHashes[i]);
            console.log('cherryPickRes', cherryPickRes);
        } catch (e) {
            console.log('EX CAUGHT: ', e);

            if (e.toString().includes('The previous cherry-pick is now empty, possibly due to conflict resolution.')) {
                console.log('Executing', 'git cherry-pick --skip');
                await execCommand('git cherry-pick --skip');
            }
        }

        // if ((typeof cherryPickRes.stdout === 'string' || cherryPickRes.stdout instanceof String) && cherryPickRes.stdout.includes('The previous cherry-pick is now empty, possibly due to conflict resolution.')) {
        //     await execCommand('git cherry-pick --skip');
        // }

        console.log(await resetDate());
    }
}

console.log(git.log(logOptions, logCb));
