import { chromium } from "playwright";
import fs from "fs/promises";

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://nextjs.org/docs");

  //get the `nav` element
  const nav = await page.$("nav.styled-scrollbar");

  if (!nav) {
    console.log("nav element not found");
    return;
  }

  const links = await nav.$$("a");

  const urls = await Promise.all(
    links.map(async (link) => {
      const url = await link.getAttribute("href");
      return url;
    })
  );

  for (const url of urls) {
    console.log("👁️ Visiting", url);
    if (url) {
      await page.goto(`https://nextjs.org${url}`);

      const content = await page.$eval(
        ".prose.prose-vercel",
        (el) => el.textContent
      );
      if (!content) {
        console.log("content not found");
        continue;
      }

      const encodedUrlForFileName = url.replace(/\//g, "_");

      const filePath = `./data/nextjs/${encodedUrlForFileName}.txt`;

      console.log("✍️ Writing to", filePath);
      fs.writeFile(filePath, content);
    }
  }

  await browser.close();
};

run();
