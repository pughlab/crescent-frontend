const fs = require('fs').promises;
const packageJson = require('./package.json');

(async () => {
    try {
        const appVersion = packageJson.version;
        const versionJson = JSON.stringify({
            version: appVersion
        });

        await fs.writeFile('./public/meta.json', versionJson);
        console.log(`meta.json file has been saved with version number ${appVersion}`);
    } catch (err) {
        console.log('An error occurred while writing JSON data to meta.json');
        throw new Error(err);
    }
})();