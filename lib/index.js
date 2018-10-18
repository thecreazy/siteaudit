const program = require( 'commander' );
const colors = require( 'colors' );
const fetch = require( 'node-fetch' );

const package = require( '../package.json' );
const Audits = require( './audits' );
const WriteFile = require( './utils/Writefile' );

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
   .option( '--no-pagespeed', 'No pagespeed audit' )
   .option( '--no-lighthouse', 'No lightouse audit' )
   .parse( process.argv );

  const {
   pagespeed,
   lighthouse,
   output = 'output',
   args
  } = program;

  const url = args && !!args.length ? args[ 0 ] : process.env.SITEAUDIT_URL

  console.log( `You will run the audit for the site: ${url}`.green );
  if ( !pagespeed ) console.log( '- Whit no Pagespeed audit'.red );
  if ( !lighthouse ) console.log( '- Whit no Lighthouse audit'.red );

  this.start = this.start.bind( this )
  this.start( url, {
   lighthouse,
   pagespeed,
   output
  } );
 }

 async start( url, options ) {
  const {
   output
  } = options
  const isAValidUrl = await this.checkUrl( url );
  if ( !isAValidUrl ) {
   console.log( 'SORRY, YOUR URL IS NOT VALID'.red );
   return;
  }

  for ( let i in this.auditsType ) {
   let _audit = this.auditsType[ i ];
   if ( options[ _audit.name ] ) {
    const result = await new Audits[ _audit.name ]( url ).start();
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