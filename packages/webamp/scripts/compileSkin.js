const puppeteer = require("puppeteer");

// const DATA_URI = /url\([^)]+\)/g;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // TODO: allow the skin to be passed in via the CLI.
  try {
    await page.goto(
      'http://localhost:8080/#{"skinUrl":"/assets/skins/base-2.91.wsz"}'
    );
  } catch (e) {
    console.error(
      "Error connecting to localhost:8080. Are you running the dev server?",
      "\n\n",
      e
    );
    await browser.close();
    return;
  }
  // TODO: Wait for node to be ready
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    const css = await page.evaluate(
      () => document.getElementById("webamp-skin").innerText
    );
    console.log(css);
  } catch (e) {
    console.error("Hit an error, putting a screenshot in ./error.png");
    page.screenshot({ path: "./error.png" });
    throw e;
  } finally {
    await browser.close();
  }

  // TODO: Extract non-CSS stuff

  // TODO: Write to stdout
})();
