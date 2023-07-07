# Web interactive map (GIS)
OceanOPS web GIS interface


# Install
Install node.js.

Install typescript globally:

    npm install -g typescript

Verify versions:

    node --version
    npm --version
    tsc --version

Install project dependencies

    npm install

# Dev run
Will compile and serve the project on localhost (consol will indicate port):

    npm run dev


# Release
## Incrementing version
Use [npm version command](https://docs.npmjs.com/cli/v9/commands/npm-version?v=true).
It will increment the project version, commit and tag it.
Depending on SemVer

    npm version patch
or

    npm version minor
or

    npm version major

## Build for release
This will create the files to deploy, in dist

    npm run build