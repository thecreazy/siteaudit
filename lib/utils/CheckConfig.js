const path = require( 'path' );
const fs = require( 'fs' );

const checkConfig = async ( configPath, basepath ) => {
 const dirname = path.join( basepath, configPath );
 try {
  const content = fs.readFileSync( dirname, "utf8" );
  const _json = JSON.parse( content )
  return _json
 } catch ( e ) {
  return false
 }

};

module.exports = checkConfig;