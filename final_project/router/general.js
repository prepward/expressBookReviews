const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


// ==================== REGISTER ====================

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered. Now you can login"
  });
});


// ==================== BOOK ROUTES ====================

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({
    message: "Book not found"
  });
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = {};

  for (const isbn in books) {
    if (
      books[isbn].author
        .toLowerCase()
        .includes(author.toLowerCase())
    ) {
      result[isbn] = books[isbn];
    }
  }

  if (Object.keys(result).length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({
    message: "No books found for this author"
  });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = {};

  for (const isbn in books) {
    if (
      books[isbn].title
        .toLowerCase()
        .includes(title.toLowerCase())
    ) {
      result[isbn] = books[isbn];
    }
  }

  if (Object.keys(result).length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({
    message: "No books found with this title"
  });
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({
    message: "Book not found"
  });
});


// ==================== AXIOS METHODS ====================

// 1. Get all books using Axios
async function getAllBooks() {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.log("Error retrieving all books:", error.message);
  }
}


// 2. Get book by ISBN using Axios
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(
      `http://localhost:5000/isbn/${isbn}`
    );
    return response.data;
  } catch (error) {
    console.log("Error retrieving book by ISBN:", error.message);
  }
}


// 3. Get books by author using Axios
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    return response.data;
  } catch (error) {
    console.log("Error retrieving books by author:", error.message);
  }
}


// 4. Get books by title using Axios
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );
    return response.data;
  } catch (error) {
    console.log("Error retrieving books by title:", error.message);
  }
});


module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
