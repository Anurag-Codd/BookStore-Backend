import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage }).fields([
  { name: "thumbnail", maxCount: 4 },
  { name: "avatar", maxCount: 1 },
]);
