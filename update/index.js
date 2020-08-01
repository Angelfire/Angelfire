const { readFile, writeFile } = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');

const parser = new Parser();
const filePathStatic = path.join(__dirname, './static.md');
const filePathReadme = path.join(__dirname, '../README.md');
const rssUrl = 'https://velocidadescape.com/rss.xml';

/**
 * 
 * @param {string} mdFile 
 */
const readMarkdown = async (mdFile) => {
  try {
    const mdData = await readFile(mdFile, 'utf8');

    return mdData;
  } catch (e) {
    throw new Error(`Failed to load file at ${mdFile}`);
  }
}

/**
 * 
 * @param {string} rssUrl 
 */
const getRSS = async(rssUrl) => {
  const feed = await parser.parseURL(rssUrl);

  if (!feed.items) {
    throw new Error('feed.items was not found!');
  }

  return feed.items[0];
}

/**
 * 
 * @param {string} mdFile 
 * @param {string} data 
 */
const writeMarkdown = async (mdFile, data) => {
  try {
    await writeFile(mdFile, data);
  } catch(e) {
    throw new Error('Failed to write file');
  }
}

/**
 * 
 * @param {string} staticMD 
 * @param {string} rssURL 
 */
const main = async(staticMD, rssURL) => {
  const oldMd = await readMarkdown(staticMD);
  const feed = await getRSS(rssURL);
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);

  const lastPost = `- Read my latest blog post: [${feed.title}](${feed.link})`;
  const date = `Last update on ${today.toDateString()}`;

  const data = `${oldMd}
${lastPost}

${date}`;

  await writeMarkdown(filePathReadme, data);
}

main(filePathStatic, rssUrl);
