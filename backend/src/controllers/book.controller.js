import Book from "./book.model";

export const fetchAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ books, message: "Books fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const fetchBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }
    res.status(200).json({ book, message: "Book fetched successfully" });
  } catch (error) {
    console.error("Error fetching book", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

export const updateBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBook) {
      return res.status(404).send({ message: "Book not found!" });
    }
    res
      .status(200)
      .send({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("Error updating book", error);
    res.status(500).send({ message: "Failed to update book" });
  }
};


