import express from 'express';
import { routeProtection } from '../middleware/routeProtection';
import { createBook, removeBookById, updateBookById } from '../controllers/seller.controller';

const router = express.Router();

router.use(routeProtection)
router.post('/add-book', upload, createBook);
router.put('/update-book/:id', upload, updateBookById);
router.delete('/delete-book/:id', removeBookById);

export default router;