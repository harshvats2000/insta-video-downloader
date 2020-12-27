const puppeteer = require('puppeteer');

class InstagramClient {
  async start() {
    this.browser = await puppeteer.launch({
      headless: false, //When set to true, a new browser window will be opened
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async stop() {
    await this.browser.close();
  }

  async getFollowers(username) {
    if (!this.browser) throw new Error('Browser not started');

    const page = await this.browser.newPage();
    await page.goto(`https://instagram.com/${username}/`);

    const pageExists = await page.evaluate((_) => {
      return document.querySelector('.error-container') === null;
    });
    if (!pageExists) {
      throw new Error(`Page of ${username} doesn't exist`);
    }

    //Wait until the page got completly renderer
    await page.waitForSelector('h1');

    const followers = await page.evaluate((username) => {
      //This code will get executed on the instagram page

      //Get the number of followers
      const followers = document
        .querySelector(`a[href="/accounts/login/?next=%2F${username}%2Ffollowers%2F&source=followed_by_list"]`)
        .querySelector('span').innerText;
      //Return the number of followers back to the node process
      return followers;
    }, username);

    page.close();

    return followers;
  }

  async getVideoDownloadLink(url) {
    if (!this.browser) throw new Error('Browser not started');

    const page = await this.browser.newPage();
    await page.goto(url);

    //Wait until the page got completly renderer
    // await page.waitForSelector('a');

    // setTimeout(async () => {
    const link = await page.evaluate(() => {
      const link = document.querySelector("meta[property='og:video']").getAttribute('content');
      return link;
    });
    page.close();
    return link;
    // }, 5000);
  }
}

module.exports = InstagramClient;
