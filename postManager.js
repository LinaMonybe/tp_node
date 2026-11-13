// postManager.js
const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, 'posts.json');

// Lire tous les posts
function getAllPosts(callback) {
  fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
    if (err) {
      return callback(err, null);
    }
    try {
      callback(null, JSON.parse(data));
    } catch (parseError) {
      callback(parseError, null);
    }
  });
}

// Obtenir un post par ID (null si introuvable)
function getPost(id, callback) {
  getAllPosts((err, posts) => {
    if (err) return callback(err, null);
    const post = posts.find((p) => p.id === Number(id));
    callback(null, post || null);
  });
}

// Insérer un nouveau post (l'id est généré côté serveur)
function insertPost(newPost, callback) {
  getAllPosts((err, posts) => {
    if (err) return callback(err, null);
    const newId = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
    const post = { ...newPost, id: newId };
    posts.push(post);
    savePosts(posts, (saveErr) => callback(saveErr, saveErr ? null : post));
  });
}

// Mettre à jour un post (null si introuvable)
function updatePost(id, updatedPost, callback) {
  getAllPosts((err, posts) => {
    if (err) return callback(err, null);
    const index = posts.findIndex((p) => p.id === Number(id));
    if (index === -1) return callback(null, null);
    posts[index] = { ...posts[index], ...updatedPost, id: posts[index].id };
    savePosts(posts, (saveErr) => callback(saveErr, saveErr ? null : posts[index]));
  });
}

// Supprimer un post (null si introuvable)
function deletePost(id, callback) {
  getAllPosts((err, posts) => {
    if (err) return callback(err, null);
    const index = posts.findIndex((p) => p.id === Number(id));
    if (index === -1) return callback(null, null);
    const [deleted] = posts.splice(index, 1);
    savePosts(posts, (saveErr) => callback(saveErr, saveErr ? null : deleted));
  });
}

// Utilitaire : sauvegarder les posts
function savePosts(posts, callback) {
  fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), callback);
}

module.exports = { getAllPosts, getPost, insertPost, updatePost, deletePost };
