const http = require("http");
const regexp = require("path-to-regexp");
const { render, _static, httpBody, toJSON, setCookie, parseCookies } = require("./utils");

const expresso = () => {
  const app = {};
  const use = [];

  const routes = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: []
  };

  const server = http.createServer(async (request, response) => {
    const url = request.url;
    if (url == '/favicon.ico') {
      response.end();
      return;
    };


    if (url.split('/').filter(Boolean).at(0) === 'static') {
      // check the callstack of use array
      const fn = use.find(item => item.fn === 'static');
      if (fn) {
        fn.callback(request, response);
        return;
      }
    }

    const method = request.method;
    const currentRoutes = routes[method];
    let route = null;

    // srearch for a matching route
    for (const item of currentRoutes) {
      const match = regexp.match(item.path, { decode: decodeURIComponent });
      const matched = match(url);
      if (matched) {
        route = { ...item };
        request.params = matched?.params;
        request.body = null;
        request.cookies = parseCookies(request);

        if (method === 'POST') {
          request.body = await httpBody(request);
        }

        response.json = toJSON(response);
        response.setCookie = setCookie(response);
        break;
      }
    }

    response.render = render(response);

    if (route) {
      route.callback(request, response);
    } else {
      // route not found
      response.writeHead(404, { "Content-Type": "text/html" });
      response.render('error@_404');
    }

  });


  app.get = (path, callback) => {
    routes['GET'] = [...routes['GET'], { path, callback }];
  }

  app.post = (path, callback) => {
    routes['POST'] = [...routes['POST'], { path, callback }];
  }

  app.use = (arg = null) => use.push(arg);

  app.static = _static;

  app.listen = (port, callback) => server.listen(port, callback);
  return app;
}

module.exports = expresso;



