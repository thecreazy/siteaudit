const path = require( 'path' );
const fs = require( 'fs' );

const WriteFile = ( dataRaw, filename, basepath, outputFolder ) => {
 const dirname = path.join( basepath, outputFolder );
 if ( !( fs.existsSync( dirname ) ) ) fs.mkdirSync( dirname )
 fs.writeFileSync( path.join( dirname, `${filename}` ), dataRaw );
};

module.exports = WriteFile;