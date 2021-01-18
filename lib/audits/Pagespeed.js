const ora = require("ora");
const psi = require("psi");
const url = require("url");

class Pagespeed {
  constructor(url, opts = {}) {
    this.url = url;
    this.auditName = `Pagespeed`;

    this.config = Object.assign(
      {},
      {
        strategies: ["mobile", "desktop"],
        pages: ["/"],
        options: {},
      },
      opts
    );

    this.start = this.start.bind(this);
    this.runPSI = this.runPSI.bind(this);
    this.runSinglePSI = this.runSinglePSI.bind(this);
    this.formatOutput = this.formatOutput.bind(this);
    this.renderResult = this.renderResult.bind(this);
    this.renderRule = this.renderRule.bind(this);
  }

  async start() {
    this.spinner = ora(`Start ${this.auditName} audit for ${this.url}`).start();
    this.spinner = this.spinner.stop();
    try {
      const { data } = await this.runPSI();
      const output = this.formatOutput(data);
      this.spinner.succeed(`Finish ${this.auditName} audit for ${this.url}`);
      return output;
    } catch (e) {
      this.spinner.fail(`Fail ${this.auditName} audit for ${this.url}`);
      console.log(e);
      return JSON.stringify(e);
    }
  }

  async runPSI() {
    const results = [];
    for (let strategy of this.config.strategies) {
      for (let page of this.config.pages) {
        const singleSpinner = ora(
          `Start ${strategy} ${this.auditName} audit for ${page} page`
        ).start();
        const singleResult = await this.runSinglePSI(
          Object.assign(
            {
              strategy,
              page,
            },
            this.config.options
          )
        );
        results.push(singleResult);
        singleSpinner.succeed(
          `Finish ${strategy} ${this.auditName} audit for ${page} page`
        );
      }
    }
    return results;
  }

  async runSinglePSI(options) {
    const { strategy, page } = options;
    const data = await psi(url.resolve(this.url, page), options);
    data.strategy = strategy;
    data.page = page;
    return data;
  }

  formatOutput(values) {
    return values.map(this.renderResult).join("");
  }

  renderResult(data) {
    let { page, strategy, ruleGroups, formattedResults } = data;
    console.log(data.lighthouseResult, data);
    let results = Object.values(formattedResults.ruleResults)
      .filter((rule) => rule.ruleImpact > 0)
      .sort((a, b) => a > b);

    return `
   ## Page: ${page}

   ### Resolution: ${strategy}

   ### PageSpeed Score: ${ruleGroups.SPEED.score}

   ### Usability Score: ${
     ruleGroups.USABILITY ? ruleGroups.USABILITY.score : "n/d"
   }

   ${results.map(this.renderRule).join("")}\n
   
  `;
  }

  renderRule(rule) {
    return `
    > ${rule.localizedRuleName}
    Rule Impact: ${rule.ruleImpact.toFixed(2)}
    ${this.extractUrlsFromRules(rule).join("\n    ")}
  ---
  `;
  }

  extractUrlsFromRules({ urlBlocks }) {
    if (!urlBlocks || !urlBlocks.length) return false;
    return urlBlocks.reduce((acc, curr) => {
      if (curr.urls && curr.urls.length) {
        return acc.concat(curr.urls.map((url) => url.result.args[0].value));
      } else {
        return acc;
      }
    }, []);
  }
}

module.exports = Pagespeed;
