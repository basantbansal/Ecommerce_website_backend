import multer from "multer"; // import the multer library, which is used for handling file uploads in Node.js applications

const storage = multer.diskStorage({ // configure the storage settings for multer, specifying how and where the uploaded files should be stored
    destination: function (req, file, cb) {
      cb(null, "./public/temp")  // specify the destination directory where the uploaded files will be stored temporarily 
    }, // meaning of callback is that it is a function that you call when you are done with the asynchronous operation. In this case, it is used to signal that the destination directory has been set and the file can be stored there.
    filename: function (req, file, cb) {
      cb(null, file.originalname) // specify the filename for the uploaded file, in this case, we are using the original name of the file as it is. You can modify this to generate unique filenames if needed.
    }
  })
  
export const upload = multer({  // create a multer instance with the defined storage settings, which can be used as middleware in routes to handle file uploads
    storage, 
})