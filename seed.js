// seed.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Récupère les posts depuis l'API (la réponse arrive en morceaux -> on concatène)
function fetchPosts() {
  https.get(API_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        savePosts(JSON.parse(data));
      } catch (err) {
        console.error('Réponse JSON invalide :', err.message);
      }
    });
  }).on('error', (err) => {
    console.error('Erreur de requête :', err.message);
  });
}

// Sauvegarde les posts dans posts.json
function savePosts(posts) {
  fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), (err) => {
    if (err) return console.error('Erreur d\'écriture :', err.message);
    console.log(`${posts.length} posts sauvegardés dans posts.json`);
  });
}

fetchPosts();
