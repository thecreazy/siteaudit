const ora = require('ora');
const psi = require('psi');
const url = require('url');

class Pagespeed {
  constructor(scopeUrl, opts = {}) {
    this.url = scopeUrl;
    this.auditName = 'Pagespeed';

    this.config = {
      strategies: ['mobile', 'desktop'],
      pages: ['/'],
      options: {},
      ...opts,
    };

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
      const data = await this.runPSI();
      const output = this.formatOutput(data);
      this.spinner.succeed(`Finish ${this.auditName} audit for ${this.url}`);
      return output;
    } catch (e) {
      this.spinner.fail(`Fail ${this.auditName} audit for ${this.url}`);
      return JSON.stringify(e);
    }
  }

  async runPSI() {
    const results = [];
    for (const strategy of this.config.strategies) {
      for (const page of this.config.pages) {
        const singleSpinner = ora(
          `Start ${strategy} ${this.auditName} audit for ${page} page`,
        ).start();
        const singleResult = await this.runSinglePSI({
          strategy,
          page,
          ...this.config.options,
        });
        results.push(singleResult);
        singleSpinner.succeed(
          `Finish ${strategy} ${this.auditName} audit for ${page} page`,
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
    return values.map(this.renderResult).join('');
  }

  renderResult(data) {
    const { page, strategy, data: resultData = {} } = data;
    const { loadingExperience = {}, lighthouseResult } = resultData;
    const { audits, timing } = lighthouseResult;
    const { metrics = {} } = loadingExperience;

    const resultsAudits = Object.values(audits).map((element) => {
      const { score, title, description } = element;
      if (score === 1) return '';
      let results = `### ${title} - Score: ${
        score === null ? 'not-scored' : score
      }  \n`;
      results += `> ${description} \n`;
      return results;
    });
    const resultPeformance = Object.keys(metrics).map(
      (key) => `> Type: ${key} - Percentile: ${metrics[key].percentile} - Result: ${metrics[key].category} \n`,
    );

    return `
# Page: ${page} - Resolution ${strategy}
> Total timing ${timing.total}

### PageSpeed Score: ${loadingExperience.overall_category}
${resultPeformance.join('\n')}

## Audits:

${resultsAudits.join('\n')}
`;
  }

  renderRule(rule) {
    return `
    > ${rule.localizedRuleName}
    Rule Impact: ${rule.ruleImpact.toFixed(2)}
    ${this.extractUrlsFromRules(rule).join('\n    ')}
  ---
  `;
  }

  extractUrlsFromRules({ urlBlocks }) {
    if (!urlBlocks || !urlBlocks.length) return false;
    return urlBlocks.reduce((acc, curr) => {
      if (curr.urls && curr.urls.length) {
        return acc.concat(
          curr.urls.map((newUrl) => newUrl.result.args[0].value),
        );
      }
      return acc;
    }, []);
  }
}

module.exports = Pagespeed;
