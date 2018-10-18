const program = require( 'commander' );
const colors = require( 'colors' );
const fetch = require( 'node-fetch' )

const package = require( '../package.json' );
const Lighthouse = require( './audits/Lighthouse' ).default;
const WriteFile = require( './utils/Writefile' ).defaults;


const {
 version
} = package



class Main {
 constructor() {
  program
   .version( version )
   .option( '-u, --url [value]', 'Set the url to run audit' )
   .option( '--no-pagespeed', 'No pagespeed audit' )
   .option( '--no-lighthouse', 'No lightouse audit' )
   .parse( process.argv );

  const {
   url,
   pagespeed,
   lighthouse
  } = program

  console.log( `You will run the audit for the site: ${url}`.green );
  if ( !pagespeed ) console.log( 'whit no Pagespeed audit'.red );
  if ( !lighthouse ) console.log( 'whit no Lighthouse audit'.red );

  this.start = this.start.bind( this )
  this.start( url, {
   lighthouse,
   pagespeed
  } )
 }

 async start( url, options ) {
  const isAValidUrl = await this.checkUrl( url )
  if ( !isAValidUrl ) {
   console.log( 'SORRY, YOUR URL IS NOT VALID'.red );
   return;
  }
  if ( options.pagespeed ) {
   const result = await new Lighthouse( url ).start()
   WriteFile( result, 'pagespeed-audit' )
  }

 }

 async checkUrl( url ) {
  try {
   const data = await fetch( url )
   return true
  } catch ( e ) {
   return false
  }
 }

}


new Main()