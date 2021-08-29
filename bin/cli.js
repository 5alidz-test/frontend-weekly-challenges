const fs = require('fs/promises');
const path = require('path');
const prompt = require('prompts');

const [COMMAND, ...OPTIONS] = process.argv.slice(2);

/* utils */
const CHALLENGES_DIR_NAME = 'challenges';
const challengeLevels = ['beginner', 'intermediate', 'pro'];
const capitalize = (str) => str[0].toUpperCase() + str.substring(1);
const dirExists = async (path) => {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
};
const weekExist = async (weekNumber) => {
  const dirs = await fs.readdir(path.join(process.cwd(), CHALLENGES_DIR_NAME));
  return dirs.filter((dir) => parseInt(dir.split('-')[1]) === weekNumber)[0] != undefined;
};
/* *******/

async function createSolutionSkeleton(week, level, username) {
  if (typeof week != 'number' || typeof level != 'number' || typeof username != 'string') {
    process.exitCode = 1;
    console.error('invalid solution options');
  } else {
    const rootPath = path.join(
      process.cwd(),
      '/challenges',
      `/week-${week}`,
      `/${challengeLevels[level]}`,
      '/solutions',
      `/${username}`
    );
    if (await dirExists(rootPath)) {
      console.log('folder already exists');
    } else {
      await fs.mkdir(rootPath);
      const readablePath = `./challenges/week-${week}/${challengeLevels[level]}/${username}`;
      console.log('folder created at: ', readablePath);
      console.log(`Good Luck!\n`);
    }
  }
}

async function createChallengeSkeleton(week) {
  try {
    const rootPath = path.join(process.cwd(), '/challenges', `/week-${week}`);
    await fs.mkdir(rootPath);
    await Promise.all(challengeLevels.map((level) => fs.mkdir(path.join(rootPath, level))));
    await Promise.all(
      challengeLevels.map(async (level) => {
        await fs.writeFile(path.join(rootPath, level, 'README.md'), `# Week ${week} ${capitalize(level)}`);
        await fs.mkdir(path.join(rootPath, level, 'solutions'));
      })
    );
  } catch (e) {
    console.error(`failed to create challenge skeleton because:`, e);
  }
}

// execute commands
(async () => {
  if (COMMAND == 'challenge') {
    const [weekNumber] = OPTIONS;
    await createChallengeSkeleton(weekNumber);
  } else if (COMMAND == 'solution') {
    const result = await prompt([
      {
        type: 'number',
        name: 'week',
        message: 'week number?',
        validate: weekExist,
      },
      {
        type: 'select',
        name: 'level',
        message: 'Choose Level',
        choices: challengeLevels,
      },
      {
        type: 'text',
        name: 'username',
        message: 'Your Github username',
        validate: (username) => /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username),
      },
    ]);
    await createSolutionSkeleton(result.week, result.level, result.username);
  } else {
    process.exitCode = 1;
    console.error(`command ${args[0]} is not recognized.`);
  }
})();
