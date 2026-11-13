// server.js
const http = require('http');
const url = require('url');
const postManager = require('./postManager');

const PORT = 3000;

function parseJsonBody(request, callback) {
  let body = '';
  request.on('data', (chunk) => { body += chunk.toString(); });
  request.on('end', () => {
    try {
      callback(null, JSON.parse(body));
    } catch (error) {
      callback(error, null);
    }
  });
}

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const pathname = parsedUrl.pathname;
  const method = request.method;

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Content-Type', 'application/json');

  // Petit helper pour éviter de répéter writeHead + end
  const send = (status, obj) => {
    response.writeHead(status);
    response.end(JSON.stringify(obj));
  };

  // Préflight CORS : le navigateur l'envoie avant POST/PUT avec JSON
  if (method === 'OPTIONS') {
    response.writeHead(204);
    return response.end();
  }

  // Extrait l'id de /api/posts/:id (null si ça ne correspond pas)
  const match = pathname.match(/^\/api\/posts\/(\d+)$/);
  const id = match ? match[1] : null;

  // GET /api/posts
  if (pathname === '/api/posts' && method === 'GET') {
    postManager.getAllPosts((err, posts) => {
      if (err) send(500, { error: 'Erreur serveur' });
      else send(200, posts);
    });
  }
  // GET /api/posts/:id
  else if (id && method === 'GET') {
    postManager.getPost(id, (err, post) => {
      if (err) send(500, { error: 'Erreur serveur' });
      else if (!post) send(404, { error: 'Post non trouvé' });
      else send(200, post);
    });
  }
  // POST /api/posts
  else if (pathname === '/api/posts' && method === 'POST') {
    parseJsonBody(request, (err, data) => {
      if (err) return send(400, { error: 'JSON invalide' });
      if (!data.title || !data.body) return send(400, { error: 'title et body sont requis' });
      postManager.insertPost(data, (err, post) => {
        if (err) send(500, { error: 'Erreur serveur' });
        else send(201, post);
      });
    });
  }
  // PUT /api/posts/:id
  else if (id && method === 'PUT') {
    parseJsonBody(request, (err, data) => {
      if (err) return send(400, { error: 'JSON invalide' });
      postManager.updatePost(id, data, (err, post) => {
        if (err) send(500, { error: 'Erreur serveur' });
        else if (!post) send(404, { error: 'Post non trouvé' });
        else send(200, post);
      });
    });
  }
  // DELETE /api/posts/:id
  else if (id && method === 'DELETE') {
    postManager.deletePost(id, (err, deleted) => {
      if (err) send(500, { error: 'Erreur serveur' });
      else if (!deleted) send(404, { error: 'Post non trouvé' });
      else send(200, { message: 'Post supprimé', post: deleted });
    });
  }
  else {
    send(404, { error: 'Route non trouvée' });
  }
});

server.listen(PORT, () => {
  console.log(`Serveur API démarré sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('  GET    /api/posts');
  console.log('  GET    /api/posts/:id');
  console.log('  POST   /api/posts');
  console.log('  PUT    /api/posts/:id');
  console.log('  DELETE /api/posts/:id');
});
