const puppeteer = require('puppeteer');

class InstagramClient {
  async start() {
    this.browser = await puppeteer.launch({
      headless: true,
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
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
    );

    await page.goto(url);
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    console.log(data);

    const link = await page.evaluate(() => {
      const link = document.querySelector("meta[property='og:video']").getAttribute('content');
      return link;
    });
    page.close();
    return link;
  }
}

module.exports = InstagramClient;
