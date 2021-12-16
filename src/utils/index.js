const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const render = (response) => {
  return (template, data = {}) => {
    const _path = path.join(__dirname, '/../../views', ...template.split('@')) + '.ejs';
    try {
      const utf = fs.readFileSync(_path, { encoding: 'utf-8' });
      const html = ejs.render(utf, data);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(html);
    } catch (error) {
      // file not found
      response.writeHead(404, { "Content-Type": "text/html" });
      response.render('ohhh no');
    }
  };
}


const _static = (__path) => {
  return {
    fn: 'static',
    callback: (request, response) => {
      const _path = path.join(__dirname, `/../../${__path}`, request.url.replace('/static', ''));
      fs.readFile(_path, function (err, data) {
        if (err) {
          response.writeHead(404);
          response.end(JSON.stringify(err));
          return;
        }
        response.writeHead(200);
        response.end(data);
        return;
      });
    }
  }
}



const httpBody = async (request) => {
  const buffers = [];
  for await (const chunk of request) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  try {
    return JSON.parse(data)
  } catch (error) {
    return data.split('&').reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[key] = value;
      return acc;
    }, {}) || null;
  }
}


const toJSON = (response) => {
  return (data) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(data));
  }
}

const setCookie = (response) => {
  return (name, value) => {
    const cookie = `${name}=${value}; path=/;`;
    response.setHeader('Set-Cookie', cookie);
  }
}

const parseCookies = (request) => {
  var list = {},
    rc = request.headers.cookie;

  rc && rc.split(';').forEach(function (cookie) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}


module.exports = {
  render,
  _static,
  httpBody,
  toJSON,
  setCookie,
  parseCookies
}