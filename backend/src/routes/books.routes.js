import express from 'express';
import { fetchAllBooks, fetchBookById, filterProduct } from '../controllers/book.controller';
const router = express.Router();

router.get('all-books', fetchAllBooks);
router.get('book/:id', fetchBookById);
router.get('filter-books', filterProduct);

export default router;