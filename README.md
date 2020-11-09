# webpack-upload-zeroojs-plugin
> Automatically upload the packaged files of webpack project

## Installation
```
npm install webpack-upload-zeroojs-plugin --save-dev
```
or
```
yarn add webpack-upload-zeroojs-plugin -D
```

## Usage
```js
// webpack.config.js
const WebpackUploadPlugin = require('webpack-upload-zeroojs-plugin');

module.exports = {
  entry: 'index.js',
  plugins: [
    new WebpackUploadPlugin({
       host: 'your remote ip or domain',
       port: 'default 22',
       username: 'default root',
       password: 'default null',
       localDir: 'local folder path，default webpack output dir',
       remoteDir: 'remote folder path'
    })
  ]
}
```
If console print `Upload complete, connection closed!!!` it's done!

# License
MIT

## Keywords
`upload` `webpack` `node-ftp` `ftp` `sftp` `ssh2` `auto` `auto-upload`

