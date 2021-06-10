require('colors');
const fetch = require('node-fetch');

const Audits = require('./audits');
const auditsType = require('./auditstype');

const WriteFile = require('./utils/Writefile');
const CheckConfig = require('./utils/CheckConfig');

class SiteAudit {
  constructor() {
    this.localPath = process.cwd();
    this.auditsType = auditsType;
    this.start = this.start.bind(this);
  }

  async start(url, options = {}) {
    const {
      outputFolder = '',
      config,
      headless,
      customAppenName = '',
    } = options;

    let customConfig = {};

    const isAValidUrl = await this.checkUrl(url);
    if (!isAValidUrl) return;

    if (config) {
      const validateConfig = await CheckConfig(config, this.localPath);
      if (!validateConfig) return;
      customConfig = validateConfig;
    }

    for (const i in this.auditsType) {
      const audit = this.auditsType[i];
      if (options[audit.name]) {
        const result = await new Audits[audit.name](
          url,
          customConfig[audit.name],
          headless
        ).start();
        WriteFile(
          result,
          `${audit.name}-audit${customAppenName}${audit.type}`,
          this.localPath,
          outputFolder
        );
      }
    }
  }

  async checkUrl(url) {
    try {
      await fetch(url);
      return true;
    } catch (e) {
      console.log('SORRY, YOUR URL IS NOT VALID'.red, e);
      return false;
    }
  }
}

module.exports = new SiteAudit();
