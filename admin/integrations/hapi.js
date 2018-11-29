/**
 * Plugin definition for Hapi.js framework. To se how you can use it
 * see {@link examples/hapijs/index.js}
 *
 * @see module:examples/hapijs~start
 *
 * @module Integrations/hapijs
 */

const Admin = require('../index')
const Routes = require('../backend/routes')
const Renderer = require('../backend/utils/renderer')

module.exports = {
  name: 'AdminBro',
  version: '1.0.0',
  register: async (server, options) => {
    const admin = new Admin(options.databases, options)
    const auth = options.auth || 'none'
    const routes = new Routes({ admin }).all()

    routes.forEach((route) => {
      server.route({
        method: route.method,
        path: `${admin.options.rootPath}${route.path}`,
        options: { auth },
        handler: async (request, h) => {
          const controller = new route.Controller({ admin }, request.auth.credentials)
          console.log(request.auth.credentials)
          const response = await controller[route.action](request, h)
          if (!response) {
            return new Renderer(route.view, controller.view).render()
          }
          return response
        },
      })
    })
  },
  renderLogin: async (params) => {
    return Admin.renderLogin(params)
  },
}
