const { program } = require("commander");
const colors = require("colors");
const fetch = require("node-fetch");

const package = require("../package.json");
const Audits = require("./audits");
const auditsType = require("./auditstype");

const WriteFile = require("./utils/Writefile");
const CheckConfig = require("./utils/CheckConfig");

const { version } = package;

class SiteAudit {
  constructor() {
    this.localPath = process.cwd();

    this.auditsType = auditsType;

    program
      .name("siteaudit")
      .version(version, "-v, --version")
      .option("--url [value]", "Specity the url of the site")
      .option("--output [value]", "Specity the output directory")
      .option("-c, --config [value]", "Path to a custom config")
      .option("--no-pagespeed", "No pagespeed audit")
      .option("--no-lighthouse", "No lightouse audit")
      .option("--no-a11y", "Generate a11y site audit")
      .option("--headless", "Start chrome in headless mode");

    program.parse(process.argv);
    const options = program.opts();

    let {
      pagespeed = !!process.env.SITEAUDIT_NOPAGESPEED,
      lighthouse = !!process.env.SITEAUDIT_NOLIGHTHOUSE,
      output = "output",
      a11y = !!process.env.SITEAUDIT_A11Y,
      headless,
      config = process.env.SITEAUDIT_CONFIG,
      url = process.env.SITEAUDIT_URL,
    } = options;

    if (!!process.env.SITEAUDIT_USINGENV) {
      lighthouse = !process.env.SITEAUDIT_NOLIGHTHOUSE;
      pagespeed = !process.env.SITEAUDIT_NOPAGESPEED;
      config = process.env.SITEAUDIT_CONFIG;
      headless = !!process.env.SITEAUDIT_HEADLESS;
      url = process.env.SITEAUDIT_URL;
      a11y = !process.env.SITEAUDIT_A11Y;
    }

    console.log(`You will run the audit for the site: ${url}`.green);
    if (!pagespeed) console.log("- With no Pagespeed audit".red);
    if (!lighthouse) console.log("- With no Lighthouse audit".red);
    if (!!config) console.log("- With custom config".green);
    if (!!headless) console.log("- In headless mode".green);
    if (!a11y) console.log("- With no a11y audit".red);

    this.start = this.start.bind(this);
    this.start(url, {
      lighthouse,
      pagespeed,
      output,
      config,
      headless,
      a11y,
    });
  }

  async start(url, options) {
    const { output, config, headless } = options;

    let _customConfig = {};

    const isAValidUrl = await this.checkUrl(url);
    if (!isAValidUrl) return;

    if (config) {
      const validateConfig = await CheckConfig(config, this.localPath);
      if (!validateConfig) return;
      _customConfig = validateConfig;
    }

    for (let i in this.auditsType) {
      let _audit = this.auditsType[i];
      if (options[_audit.name]) {
        const result = await new Audits[_audit.name](
          url,
          _customConfig[_audit.name],
          headless
        ).start();
        WriteFile(
          result,
          `${_audit.name}-audit${_audit.type}`,
          this.localPath,
          output
        );
      }
    }
  }

  async checkUrl(url) {
    try {
      await fetch(url);
      return true;
    } catch (e) {
      console.log("SORRY, YOUR URL IS NOT VALID".red, e);
      return false;
    }
  }
}

module.exports = SiteAudit;
