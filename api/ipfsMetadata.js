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
                            const cid = await Promise.all(
                                req.files.map(async file => {
                                
                                    const metadata = await client.store({
                                        name: req.body.name,
                                        description:  req.body.description,
                                        image: new File(
                                          [
                                            file.buffer
                                          ],
                                          file.originalname,
                                          { type: file.mimetype}
                                        ),
                                      })
                                    return metadata.ipnft.toString();
                                })
                                )
                        const result = { message: 'POST request handled successfully',cid:cid[0],url:"https://nftstorage.link/ipfs/" + cid + "/metadata.json"};
                        return res.status(200).json(result);
                        });
              } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
              }
      /*
      (async (name,description,file) => {
        try {

            const client = new NFTStorage({ token: req.body.token});
            const metadata = await client.store({
                name: name,
                description:  description,
                image: new File(
                  [
                    file.buffer
                  ],
                  file.originalname,
                  { type: file.mimetype}
                ),
              })
          // Do something with metadata
        } catch (error) {
          // Handle error
		          console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
        }
      })(req.body.name,req.body.description,req.files[0]);
      */
      break;

    default:
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
