import express from 'express';
import connectDB from './db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Express app setup
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to DB (optional)
connectDB();

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads'); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


const fileSchema = new mongoose.Schema({
    filename: String,
    public_id: String,
    imgUrl: String,
    description: String,
})


const file = mongoose.model('cloudinary', fileSchema);

// Routes
app.get('/', (req, res) => {
    res.render('index', { url: null });
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const filePath = req.file.path;

        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'uploadfilefromcloudinary'
        });

        fs.unlinkSync(filePath); // Clean up local file

        const savetoDb = await file.create({
            filename: file.originalname,
            public_id: result.public_id,
            imgUrl: result.secure_url
        })
        res.render('index', { url: result.secure_url });
        console.log('Uploaded to Cloudinary:', result.secure_url,savetoDb);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).send('Upload failed.');
    }
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
