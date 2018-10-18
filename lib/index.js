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
  }, {
   name: 'lighthouse',
   type: '.html'
  } ];


  program
   .version( version, '-v, --version' )
   .usage( 'url [options]' )
   .option( '--output', 'Specity the output folder' )
   .option( '-c, --config [value]', 'Path to a custom config' )
   .option( '--no-pagespeed', 'No pagespeed audit' )
   .option( '--no-lighthouse', 'No lightouse audit' )
   .parse( process.argv );

  const {
   pagespeed,
   lighthouse,
   output = 'output',
   args,
   config
  } = program;

  const url = args && !!args.length ? args[ 0 ] : process.env.SITEAUDIT_URL

  console.log( `You will run the audit for the site: ${url}`.green );
  if ( !pagespeed ) console.log( '- With no Pagespeed audit'.red );
  if ( !lighthouse ) console.log( '- With no Lighthouse audit'.red );
  if ( !!config ) console.log( '- With custom config'.green )

  this.start = this.start.bind( this )
  this.start( url, {
   lighthouse,
   pagespeed,
   output,
   config
  } );
 }

 async start( url, options ) {
  const {
   output,
   config
  } = options


  let _customConfig = {}

  const isAValidUrl = await this.checkUrl( url );
  if ( !isAValidUrl ) {
   console.log( 'SORRY, YOUR URL IS NOT VALID'.red );
   return;
  }

  if ( config ) {
   const validateConfig = await CheckConfig( config, this.localPath )
   if ( !validateConfig ) {
    console.log( 'SORRY, YOUR CONFIG IS NOT VALID'.red );
    return;
   }
   _customConfig = validateConfig
  }

  for ( let i in this.auditsType ) {
   let _audit = this.auditsType[ i ];
   if ( options[ _audit.name ] ) {
    const result = await new Audits[ _audit.name ]( url, _customConfig[ _audit.name ] ).start();
    WriteFile( result, `${_audit.name}-audit${_audit.type}`, this.localPath, output );
   }
  }
 }

 async checkUrl( url ) {
  try {
   const data = await fetch( url );
   return true;
  } catch ( e ) {
   return false;
  }
 }

}


module.exports = SiteAudit;