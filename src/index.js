const program = require( 'commander' );
const colors = require( 'colors' );
const fetch = require( 'node-fetch' )

const package = require( '../package.json' );
const Audits = require( './audits' )
const WriteFile = require( './utils/Writefile' );
console.log( WriteFile )

const {
 version
} = package



class Main {
 constructor() {
  this.auditsType = [ 'pagespeed', 'lighthouse' ];


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

  for ( let i in this.auditsType ) {
   if ( options[ this.auditsType[ i ] ] ) {
    console.log( this.auditsType[ i ] )
    const result = await new Audits[ this.auditsType[ i ] ]( url ).start()
    WriteFile( result, `${this.auditsType[ i ]}-audit` )
   }
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