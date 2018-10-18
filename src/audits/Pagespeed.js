const ora = require( 'ora' );
const psi = require( 'psi' );

class Pagespeed {
  constructor( url ) {
    this.url = url
    this.config = Object.assign( {}, {
      strategies: [ 'mobile', 'desktop' ],
      pages: [ '/' ],
      options: {}
    } )

    this.start = this.start.bind( this )
    this.runPSI = this.runPSI.bind( this )
    this.runSinglePSI = this.runSinglePSI.bind( this )
    this.formatOutput = this.formatOutput.bind( this );
    this.renderResult = this.renderResult.bind( this );
    this.renderRule = this.renderRule.bind( this )
  }

  async start() {
    this.spinner = ora( `Start Pagespeed audit for ${this.url}` ).start();
    this.spinner = this.spinner.stop()
    const results = await this.runPSI();
    const output = this.formatOutput( results );
    this.spinner.succeed( `Finish Pagespeed audit for ${this.url}` )
    return output
  }

  async runPSI() {
    const results = []
    for ( var strategy of this.config.strategies ) {
      const singleSpinner = ora( `Start ${strategy} Pagespeed audit` ).start();
      const singleResult = await this.runSinglePSI( Object.assign( {
        strategy,
      }, this.config.options ) )
      results.push( singleResult )
      singleSpinner.succeed( `Finish ${strategy} Pagespeed audit` )
    }
    return results
  }

  async runSinglePSI( options ) {
    const {
      strategy
    } = options;
    const data = await psi( this.url, options );
    data.strategy = strategy;
    return data
  }

  formatOutput( values ) {
    return values.map( this.renderResult ).join( '' )
  }

  renderResult( data ) {
    let {
      page,
      strategy,
      ruleGroups,
      formattedResults
    } = data

    let results = Object.values( formattedResults.ruleResults )
      .filter( rule => rule.ruleImpact > 0 )
      .sort( ( a, b ) => a > b );

    return `
   ## Page: ${page}

   ### Resolution: ${strategy}

   ### PageSpeed Score: ${ruleGroups.SPEED.score}

   ### Usability Score: ${ruleGroups.USABILITY ? ruleGroups.USABILITY.score : 'n/d'}

   ${results.map( this.renderRule ).join( '' )}\n
   
  `;
  }

  renderRule( rule ) {
    return `
    > ${rule.localizedRuleName}
    Rule Impact: ${rule.ruleImpact.toFixed(2)}
    ${this.extractUrlsFromRules( rule ).join( '\n    ' )}
  ---
  `
  }

  extractUrlsFromRules( {
    urlBlocks
  } ) {
    if ( !urlBlocks || !urlBlocks.length ) return false;
    return urlBlocks.reduce( ( acc, curr ) => {
      if ( curr.urls && curr.urls.length ) {
        return acc.concat( curr.urls.map( url => url.result.args[ 0 ].value ) );
      } else {
        return acc;
      }
    }, [] )
  }


}

module.exports = Pagespeed