const path = require( 'path' );
const fs = require( 'fs' );

const WriteFile = ( dataRaw, filename ) => {
 fs.writeFileSync( path.join( __dirname, '../../output', `${filename}` ), dataRaw );
}

module.exports = WriteFile