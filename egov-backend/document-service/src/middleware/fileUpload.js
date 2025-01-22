const multer = require("multer");
const path = require("path");

const createUploadMiddleware = (req, res, next) => {
  let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      let p = path.join(__dirname, "../../public");
      callback(null, p);
    },
    filename: function (req, file, callback) {
      callback(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "image/webp",
      "image/svg+xml",
      "image/gif", // Added GIF support
      "video/mp4", //new
      "video/avi", //new
      "video/mpeg", //new
      "video/webm", //new
    ];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, JPG, PDF, WEBP, SVG, MP4, AVI, MPEG, and WEBM files are allowed."
        )
      );
    }
  };

  const limits = {
    // fileSize: 1024 * 1024 * 5, // 5 MB
    fileSize: 1024 * 1024 * 50, // 50 MB limit for video files (adjust as needed)
  };

  let upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
  }).array("documentFile");
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).json({
        message: err.message,
        success: false,
        data: {},
      });
    }
    next();
  });
};

module.exports = createUploadMiddleware;
