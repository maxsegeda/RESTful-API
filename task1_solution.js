const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/books_collection', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error);
  });

const booksSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publication_year: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const Books = mongoose.model('Books', booksSchema);

const app = express();

app.use(express.json());

app.get('/allBooks', (req, res) => {
  Books.find()
    .then(books => {
      res.json(books);
    })
    .catch(error => {
      console.error('Error getting books from database:', error);
      res.status(500).json({ error: 'Failed to get books' });
    });
});

app.get('/book/:id', (req, res) => {
  const bookId = req.params.id;
  Books.findById(bookId)
    .then(book => {
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    })
    .catch(error => {
      console.error('Error getting book from database:', error);
      res.status(500).json({ error: 'Failed to get book' });
    });
});

app.post('/newBook', (req, res) => {
  const { title, author, publication_year, genre, description, price, quantity } = req.body;
  const newBook = new Books({
    _id: mongoose.Types.ObjectId(),
    title,
    author,
    publication_year,
    genre,
    description,
    price,
    quantity
  });

  newBook.save()
    .then(savedBook => {
      res.status(201).json(savedBook);
    })
    .catch(error => {
      console.error('Error saving book to database:', error);
      res.status(500).json({ error: 'Failed to save book' });
    });
});

app.put('/bookChange/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author, publication_year, genre, description, price, quantity } = req.body;

  Books.findByIdAndUpdate(bookId, {
    title,
    author,
    publication_year,
    genre,
    description,
    price,
    quantity
  })
    .then(() => {
      res.status(200).json({ message: 'Product updated successfully' });
    })
    .catch(error => {
      console.error('Error updating book in database:', error);
      res.status(500).json({ error: 'Failed to update book' });
    });
});

app.delete('/bookDelete/:id', (req, res) => {
  const bookId = req.params.id;

  Books.findByIdAndDelete(bookId)
    .then(() => {
      res.status(200).json({ message: 'Product deleted successfully' });
    })
    .catch(error => {
      console.error('Error deleting book from database:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    });
});

app.get('/sortingBooks', (req, res) => {
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  const sortBy = req.query.sortBy;

  let filterOptions = {};
  let sortOptions = {};

  if (minPrice) {
    filterOptions.price = { $gte: parseInt(minPrice) };
  }

  if (maxPrice) {
    filterOptions.price = { ...filterOptions.price, $lte: parseInt(maxPrice) };
  }

  if (sortBy === 'asc') {
    sortOptions.price = 1;
  } else if (sortBy === 'desc') {
    sortOptions.price = -1;
  }

  Books.find(filterOptions)
    .sort(sortOptions)
    .then(books => {
      res.json(books);
    })
    .catch(error => {
      console.error('Error getting books from database:', error);
      res.status(500).json({ error: 'Failed to get books' });
    });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

