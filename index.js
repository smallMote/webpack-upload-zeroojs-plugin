/**
 * @author Luckyoung
 * @licence MIT
 * @github https://github.com/smallMote/webpack-sftp-plugin
 * @version beta-0.1.2
 */
const Sftp = require('ssh2-sftp-client')
const path = require('path')
const fs = require('fs')

/**
 * Ergodic files
 * @param dirPath folder path
 * @param reg You can use reg filter files name
 * @returns {[path]}
 */
function readAllFile(dirPath, reg) {
	let resultArr = []
	const thisFn = arguments.callee
	if (fs.existsSync(dirPath)) {
		const stat = fs.lstatSync(dirPath)
		if (stat.isDirectory()) {
			const files = fs.readdirSync(dirPath)
			files.forEach(function (file) {
				const t = thisFn(dirPath + '/' + file, reg)
				resultArr = resultArr.concat(t)
			})
		} else {
			if (reg !== undefined) {
				if (typeof reg.test == 'function'
					&& reg.test(dirPath)) {
					resultArr.push(dirPath)
				}
			}
			else {
				resultArr.push(dirPath)
			}
		}
	}
	return resultArr
}

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
	const { localeDir, remoteDir } = config
	let rootLocalDirName = path.dirname(localeDir)
	const sftp = new Sftp()
	sftp.connect(config).then(() => {
		let tempDir = new Set()
		const savePaths = readAllFile(localeDir).map(item => {
			const savePath = item.replace(rootLocalDirName, remoteDir).replace(/\\/g, '/')
			tempDir.add(path.dirname(savePath))
			return { localPath: item, savePath }
		})
		tempDir = [...tempDir].map(item => {
			return sftp.mkdir(item, true)
		})
		return Promise.all(tempDir).then(() => savePaths)
	})
		.then(res => {
			return Promise.all(res.map(item => {
				return sftp.put(item.localPath, item.savePath)
			}))
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
		// let remoteDir = path.join(this.config.remoteDir, localeDir.substr(localeDir.lastIndexOf('\\') + 1))
		// remoteDir = remoteDir.replace(/\\/g, '/')
		compiler.hooks.afterEmit.tap('WebpackSftpPlugin', () => {
			uploadFiles({
				...this.config,
				localeDir
			})
		})
	}
}

module.exports = WebpackSftpPlugin
