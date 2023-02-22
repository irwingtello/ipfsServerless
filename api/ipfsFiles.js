const multer = require('multer');
const { validationResult } = require('express-validator');
const { NFTStorage,File }=require('nft.storage');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const fs = require('fs');

module.exports = (req, res) => {
  switch (req.method) {
    case 'POST':
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Handle the POST request with multiple files
      try {
        // Use the `upload.array` method to process the files
        upload.array('files')(req, res, async (uploadError) => {
          if (uploadError) {
            console.error(uploadError);
            return res.status(400).json({ message: 'Invalid request' });
          }

            const client = new NFTStorage({ token: req.body.token});
            const filesToUpload = await Promise.all(
                req.files.map(async file => {
               return new File([file.buffer], file.originalname)
                })
              )
            const cid = await client.storeDirectory(filesToUpload);
        const result = { message: 'POST request handled successfully',cid:cid,url:"https://nftstorage.link/ipfs/" + cid};
          return res.status(200).json(result);
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      break;

    default:
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
