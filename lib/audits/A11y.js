const ora = require('ora');
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');

class Pagespeed {
  constructor(url, opts = {}, isHeadless) {
    this.url = url;
    this.auditName = 'A11y';
    this.isHeadless = isHeadless;
    this.browser = null;

    this.config = { ...opts };

    this.start = this.start.bind(this);
    this.a11Request = this.a11Request.bind(this);
  }

  async start() {
    this.spinner = ora(`Start ${this.auditName} audit for ${this.url}`).start();
    try {
      const result = await this.a11Request();
      const formattedResult = this.formatResult(result);
      if (this.browser !== null) await this.browser.close();
      this.spinner.succeed(`Finish ${this.auditName} audit for ${this.url}`);
      return formattedResult || '# Well, your page have no problems';
    } catch (e) {
      this.spinner.fail(`Fail ${this.auditName} audit for ${this.url}`);
      return JSON.stringify(e);
    }
  }

  async a11Request() {
    if (this.isHeadless) {
      this.browser = await this.getBrowserInstance();
    }
    return pa11y(this.url, {
      browser: this.browser,
      ...this.config,
    }).then((data) => (data.issues ? data.issues : []));
  }

  formatResult(result) {
    const results = result.map(
      (res) => `
   # Code: **${res.code}**

   ## Severity: **${res.type}**

   ## MessGE: **${res.message}**

   ## Elements:

   \`\`\`
   ${res.selector.trim()}
   \`\`\`

   `,
    );

    return results.join('');
  }

  getBrowserInstance() {
    return puppeteer.launch({
      args: [
        '--headless',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });
  }
}

module.exports = Pagespeed;
