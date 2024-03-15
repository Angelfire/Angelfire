import Parser from "rss-parser";

import { readFile, writeFile } from "fs/promises";
import path from "path";

const parser = new Parser();

const filePathStatic = path.join(
  new URL("./static.md", import.meta.url).pathname
);
const filePathReadme = path.join(
  new URL("../README.md", import.meta.url).pathname
);

const rssUrl = "https://velocidadescape.com/rss.xml";

/**
 * Reads a Markdown file.
 *
 * @param mdFile Path to the Markdown file.
 * @returns The contents of the Markdown file.
 */
const readMarkdown = async (mdFile) => {
  try {
    const mdData = await readFile(mdFile, "utf8");

    return mdData;
  } catch (e) {
    throw new Error(`Failed to load file at ${mdFile}`);
  }
};

/**
 * Fetches and parses an RSS feed.
 *
 * @param rssUrl The URL of the RSS feed.
 * @returns The first item from the RSS feed.
 */
const getRSS = async (rssUrl) => {
  const feed = await parser.parseURL(rssUrl);

  if (!feed.items) {
    throw new Error("feed.items was not found!");
  }

  const firstItem = feed.items[0];

  if (!firstItem || !firstItem.title || !firstItem.link) {
    throw new Error(
      "Invalid RSS feed format: Missing title or link in first item"
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
const writeMarkdown = async (mdFile, data) => {
  try {
    await writeFile(mdFile, data);
  } catch (e) {
    throw new Error("Failed to write file");
  }
};

/**
 * Updates a README file with the latest blog post from an RSS feed.
 *
 * @param staticMD Path to a static Markdown file.
 * @param rssURL The URL of the RSS feed.
 */
const main = async (staticMD, rssURL) => {
  const oldMd = await readMarkdown(staticMD);
  const feedItem = await getRSS(rssURL);
  const today = new Date();

  const lastPost = `Read my latest blog post: [${feedItem.title}](${feedItem.link})`;
  const date = `Last update on ${today.toDateString()}`;

  const data = `${oldMd}

${lastPost}

${date}`;

  await writeMarkdown(filePathReadme, data);
};

main(filePathStatic, rssUrl);
