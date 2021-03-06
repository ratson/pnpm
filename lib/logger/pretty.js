var chalk = require('chalk')

var observatory = require('observatory')
observatory.settings({ prefix: '  ', width: 74 })

/*
 * Logger.
 *
 *     add = logger()
 *
 *     log = add({ name: 'rimraf', rawSpec: 'rimraf@2.5.1' })
 *     log('resolved', pkgData)
 *     log('downloading')
 *     log('downloading', { done: 1, total: 200 })
 *     log('depnedencies')
 *     log('error', err)
 */

module.exports = function logger () {
  var tasks = {}

  function getTask (pkg) {
    if (tasks[pkg.rawSpec]) return tasks[pkg.rawSpec]
    var task = observatory.add(
      (pkg.name ? (pkg.name + ' ') : '') +
      chalk.gray(pkg.rawSpec || ''))
    task.status(chalk.gray('·'))
    tasks[pkg.rawSpec] = task
    return task
  }

  return function (pkg) {
    var pkgData // package.json
    var res // resolution

    // lazy get task
    function t () {
      return getTask(pkg)
    }

    // the first thing it (probably) does is wait in queue to query the npm registry
    return status

    function status (status, args) {
      if (status === 'resolving') {
        t().status(chalk.yellow('finding ·'))
      } else if (status === 'resolved') {
        res = args
      } else if (status === 'download-queued') {
        if (res.version) {
          t().status(chalk.gray('queued ' + res.version + ' ↓'))
        } else {
          t().status(chalk.gray('queued ↓'))
        }
      } else if (status === 'downloading' || status === 'download-start') {
        if (res.version) {
          t().status(chalk.yellow('downloading ' + res.version + ' ↓'))
        } else {
          t().status(chalk.yellow('downloading ↓'))
        }
        if (args && args.total && args.done < args.total) {
          t().details('' + Math.round(args.done / args.total * 100) + '%')
        } else {
          t().details('')
        }
      } else if (status === 'done') {
        if (pkgData) {
          t().status(chalk.green('' + pkgData.version + ' ✓'))
            .details('')
        } else {
          t().status(chalk.green('OK ✓'))
            .details('')
        }
      } else if (status === 'package.json') {
        pkgData = args
      } else if (status === 'dependencies') {
        t().status(chalk.gray('' + pkgData.version + ' ·'))
          .details('')
      } else if (status === 'error') {
        t().status(chalk.red('ERROR ✗'))
          .details('')
      } else if (status === 'stdout') {
        observatory.add(chalk.blue(args.name) + '  ' + chalk.gray(args.line))
      } else if (status === 'stderr') {
        observatory.add(chalk.blue(args.name) + '! ' + chalk.gray(args.line))
      } else {
        t().status(status)
          .details('')
      }
    }
  }
}
