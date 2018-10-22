const ora = require( 'ora' );
const lighthouse = require( 'lighthouse' );
const ReportGenerator = require( 'lighthouse/lighthouse-core/report/report-generator' );
const chromeLauncher = require( 'chrome-launcher' );

class Lighthouse {
 constructor( url, opts = {}, isHeadless ) {
  this.url = url;
  this.auditName = `Lighthouse`;

  const defaultFlag = [ '--show-paint-rects' ];
  const headlessFlag = [ '--headless', '--disable-gpu', '--disable-software-rasterizer', '--disable-dev-shm-usage', '--no-sandbox' ];

  this.config = Object.assign( {}, {
   chromeFlags: isHeadless ? headlessFlag : defaultFlag
  }, opts );

  this.start = this.start.bind( this );
 }

 async start() {
  this.spinner = ora( `Start ${this.auditName} audit for ${this.url}` ).start();
  try {
   const results = await this.launchChromeAndRunLighthouse( this.url, this.config );
   const html = ReportGenerator.generateReport( results, 'html' );
   this.spinner.succeed( `Finish ${this.auditName} audit for ${this.url}` );
   return html;
  } catch ( e ) {
   this.spinner.fail( `Finish ${this.auditName} audit for ${this.url}` );
   return JSON.stringify( e );
  }
 }

 async launchChromeAndRunLighthouse( url, opts, config = null ) {
  const chrome = await chromeLauncher.launch( {
   chromeFlags: opts.chromeFlags
  } );
  opts.port = chrome.port;
  const results = await lighthouse( url, opts, config );
  return chrome.kill().then( () => results.lhr );
 }
}


module.exports = Lighthouse;