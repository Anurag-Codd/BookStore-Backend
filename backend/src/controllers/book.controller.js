import Book from "./book.model";

export const fetchAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    return res
      .status(200)
      .json({ books, message: "Books fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const fetchBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }
    return res.status(200).json({ book, message: "Book fetched successfully" });
  } catch (error) {
    console.error("Error fetching book", error);
    return res.status(500).json({ message: "Failed to fetch book" });
  }
};

export const filterProduct = async (req, res) => {
  const { genre, name } = req.body;
  if (!genre || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: name, $options: "i" } },
        { genre: { $in: genre } },
      ],
    });
    return res
      .status(200)
      .json({ books, message: "Books fetched successfully" });
  } catch (error) {
    console.error("Error fetching books", error);
    return res.status(500).json({ message: "Failed to fetch books" });
  }
};

