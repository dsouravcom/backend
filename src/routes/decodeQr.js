const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Jimp } = require("jimp");
const jsQR = require("jsqr");
const logger = require("../logger.js");

// Configure multer for file uploads with memory storage and size limit
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // Set limit to 2 MB (2 * 1024 * 1024 bytes)
    }
});

// Function to decode QR code from image buffer
async function decodeQR(buffer) {
    try {
        const image = await Jimp.read(buffer);
        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height,
        };

        const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (!decodedQR) {
            throw new Error('No QR code found in the image.');
        }

        return decodedQR.data; // Return the decoded data
    } catch (error) {
        console.error("Error decoding QR code: ", error);
        throw new Error(`Error decoding QR code: ${error.message}`);
    }
}

// API endpoint to upload and decode QR code images
router.post('/', (req, res, next) => {
    // Use multer to handle file upload
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // If file size exceeds limit, send a 413 error with a JSON message
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'File too large. Please upload a file smaller than 2MB.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // Handle any other errors
            return res.status(500).json({ error: err.message });
        }

        // Proceed to the next step if there are no errors
        next();
    });
}, async (req, res) => {
    try {
        // Check if an image file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Decode the QR code from the uploaded image buffer
        const qrData = await decodeQR(req.file.buffer);

        // If QR code data is found, return it in the response
        logger.info(`Decoded QR code: ${qrData}`);
        res.json({ success: true, data: qrData });
    } catch (error) {
        // Handle any errors during the decoding process
        logger.error(`Error decoding QR code: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;