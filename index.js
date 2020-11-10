/* eslint-disable */
/**
 * @author Luckyoung
 * @licence MIT
 * @github https://github.com/smallMote/webpack-sftp-plugin
 * @version beta-0.2.2
 */
const Sftp = require('ssh2-sftp-client')
const path = require('path')
const fs = require('fs')

/**
 * webpack plugin webpack-sftp-plugin
 * @param {Object} config 参数配置
 * {
 *   host: 'your remote ip or domain',
 *   port: 'default 22',
 *   username: 'default root',
 *   password: 'default null',
 *   localDir: 'local folder path',
 *   remoteDir: 'remote folder path'
 * }
 */
function uploadFiles(config= { port: 22, username: 'root' }) {
	const sftp = new Sftp()
	sftp.connect(config).then(() => {
		const { remoteDir, localDir } = config
		const savePath = path.join(remoteDir, path.basename(localDir)).replace(/\\/g, '/')
		console.log('Uploading...')
		try {
			return sftp.uploadDir(localDir, savePath)
		} catch (e) {
			console.log('upload is fail, connection closed! ERR:', e)
			sftp.end()
		}
	})
		.then(() => {
			sftp.end()
			console.log('Upload complete, connection closed!!!')
		})
		.catch(e => {
			console.log('upload is fail, connection closed! ERR:', e)
			sftp.end()
		})
}

class WebpackSftpPlugin {
	constructor(config = {}) {
		this.config = config
	}

	apply(compiler) {
		const localeDir = this.config.localeDir || compiler.options.output.path
		compiler.hooks.afterEmit.tap('WebpackSftpPlugin', () => {
			uploadFiles({
				...this.config,
				localeDir
			})
		})
	}
}

module.exports = WebpackSftpPlugin
