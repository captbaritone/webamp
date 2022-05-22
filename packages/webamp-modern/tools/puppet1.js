const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // const homepage = 'http://localhost:8080';
  // const homepage = 'http://localhost:8080/?skin=assets/MMD3.wal';
  const homepage = "http://localhost:8080/?skin=assets/Gizmo2.0.face";
  await page.goto(homepage, {
    // waitUntil: 'networkidle2',
    // waitUntil: 'load',
    // waitUntil: 'domcontentloaded',
    waitUntil: "networkidle0",
  });

  // await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
  // const css = await page.evaluate(() => {
  //   document.getElementById("web-amp").innerHTML;
  // });
  // console.log('ini isi webamp coy', css);

  await page.screenshot({ path: "example.png", omitBackground: true });

  await browser.close();
})();
