const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (like index.html) from the 'public' directory
app.use(express.static('public'));
const mongoUri = process.env.MONGODB_URI || 'mongodb://34.171.52.200:27017/testdb';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const dataSchema = new mongoose.Schema({
    name: String,
    age: Number
}, {
    versionKey: false
});

const Data = mongoose.model('Data', dataSchema);

// Endpoint to insert data
app.post('/insert', async (req, res) => {
    const { name, age } = req.body;

    const newData = new Data({ name, age });

    try {
        await newData.save();
        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error inserting data' });
    }
});

// Endpoint to fetch data
app.get('/fetch', async (req, res) => {
    try {
        const data = await Data.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
