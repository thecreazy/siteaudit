const path = require( 'path' );
const fs = require( 'fs' );

const WriteFile = ( dataRaw, filename ) => {
 fs.writeFileSync( path.join( __dirname, '../..', `${filename}.md` ), dataRaw );
}

module.exports = WriteFile