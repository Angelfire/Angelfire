import Parser from "rss-parser";

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const parser = new Parser();

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const filePathStatic = path.resolve(currentDirPath, "static.md");
const filePathReadme = path.resolve(currentDirPath, "..", "README.md");

const rssUrl = "https://velocidadescape.com/rss.xml";

/**
 * Reads a Markdown file.
 *
 * @param mdFile Path to the Markdown file.
 * @returns The contents of the Markdown file.
 */
const readMarkdown = async (mdFilePath) => readFile(mdFilePath, "utf8");

/**
 * Fetches and parses an RSS feed.
 *
 * @param rssUrl The URL of the RSS feed.
 * @returns The first item from the RSS feed.
 */
const getRSS = async (rssURL) => {
  const feed = await parser.parseURL(rssURL);

  if (!feed.items) {
    throw new Error("feed.items was not found!");
  }

  const firstItem = feed.items[0];

  if (!firstItem || !firstItem.title || !firstItem.link) {
    throw new Error(
      "Invalid RSS feed format: Missing title or link in first item",
    );
  }

  return firstItem;
};

/**
 * Writes data to a Markdown file.
 *
 * @param mdFile Path to the Markdown file.
 * @param data The data to write to the file.
 */
const writeMarkdown = async (mdFilePath, data) => {
  await writeFile(mdFilePath, data, "utf8");
};

/**
 * Updates a README file with the latest blog post from an RSS feed.
 *
 * @param staticMD Path to a static Markdown file.
 * @param rssURL The URL of the RSS feed.
 */
const main = async (staticMD = filePathStatic, rssURL = rssUrl) => {
  const oldMd = await readMarkdown(staticMD);
  const feedItem = await getRSS(rssURL);
  const today = new Date();

  const lastPost = `Read my latest blog post: [${feedItem.title}](${feedItem.link})`;
  const date = `Last update on ${today.toDateString()}`;

  const data = `${oldMd.trimEnd()}

${lastPost}

${date}`;

  await writeMarkdown(filePathReadme, data);
};

try {
  await main();
  console.log("README.md updated successfully");
} catch (error) {
  console.error("Failed to update README.md");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
}
