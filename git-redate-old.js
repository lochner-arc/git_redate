

// require the library, main export is a function
const simpleGit = require('simple-git');
// simpleGit().clean(simpleGit.CleanOptions.FORCE);

console.log('Hello world');
const projectDir = process.argv[2];
console.log('projectDir', projectDir);

//process.chdir('/tmp');


const git = simpleGit(); // simpleGit('../customer-data');

console.log(git.cwd(projectDir));

// const logOptions = {
//     file: projectDir,
// };

const logOptions = {};

const logCb = (s, two) => {
    console.log('s', s);
    console.log('two', two);
}


console.log(git.log(logOptions, logCb));
