const program = require( 'commander' );
const colors = require( 'colors' );
const fetch = require( 'node-fetch' );

const package = require( '../package.json' );
const Audits = require( './audits' );

const WriteFile = require( './utils/Writefile' );
const CheckConfig = require( './utils/CheckConfig' );

const {
  version
} = package;

class SiteAudit {
  constructor() {
    this.localPath = process.cwd();

    this.auditsType = [ {
        name: 'pagespeed',
        type: '.md'
      },
      {
        name: 'lighthouse',
        type: '.html'
      }
    ];

    program
      .version( version, '-v, --version' )
      .usage( 'url [options]' )
      .option( '--output', 'Specity the output directory' )
      .option( '-c, --config [value]', 'Path to a custom config' )
      .option( '--no-pagespeed', 'No pagespeed audit' )
      .option( '--no-lighthouse', 'No lightouse audit' )
      .option( '--headless', 'Start chrome in headless mode' )
      .parse( process.argv );

    let {
      pagespeed = !!process.env.SITEAUDIT_NOPAGESPEED,
        lighthouse = !!process.env.SITEAUDIT_NOLIGHTHOUSE,
        output = 'output',
        args,
        headless,
        config = process.env.SITEAUDIT_CONFIG
    } = program;

    let url = args && !!args.length ? args[ 0 ] : process.env.SITEAUDIT_URL;

    if ( !!process.env.SITEAUDIT_USINGENV ) {
      lighthouse = !process.env.SITEAUDIT_NOLIGHTHOUSE;
      pagespeed = !process.env.SITEAUDIT_NOPAGESPEED;
      config = process.env.SITEAUDIT_CONFIG;
      headless = !!process.env.SITEAUDIT_HEADLESS;
      url = process.env.SITEAUDIT_URL;
    }

    console.log( `You will run the audit for the site: ${url}`.green );
    if ( !pagespeed ) console.log( '- With no Pagespeed audit'.red );
    if ( !lighthouse ) console.log( '- With no Lighthouse audit'.red );
    if ( !!config ) console.log( '- With custom config'.green );
    if ( !!headless ) console.log( '- In headless mode'.green );

    this.start = this.start.bind( this );
    this.start( url, {
      lighthouse,
      pagespeed,
      output,
      config,
      headless
    } );
  }

  async start( url, options ) {
    const {
      output,
      config,
      headless
    } = options;

    let _customConfig = {};

    const isAValidUrl = await this.checkUrl( url );
    if ( !isAValidUrl ) return;

    if ( config ) {
      const validateConfig = await CheckConfig( config, this.localPath );
      if ( !validateConfig ) return;
      _customConfig = validateConfig;
    }

    for ( let i in this.auditsType ) {
      let _audit = this.auditsType[ i ];
      if ( options[ _audit.name ] ) {
        const result = await new Audits[ _audit.name ]( url, _customConfig[ _audit.name ], headless ).start();
        WriteFile( result, `${_audit.name}-audit${_audit.type}`, this.localPath, output );
      }
    }
  }

  async checkUrl( url ) {
    try {
      const data = await fetch( url );
      return true;
    } catch ( e ) {
      console.log( 'SORRY, YOUR URL IS NOT VALID'.red, e );
      return false;
    }
  }
}

module.exports = SiteAudit;