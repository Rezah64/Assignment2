const express = require('express');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// Set the region
AWS.config.update({ region: 'us-west-2' });

// Create DynamoDB service object
const dynamodb = new AWS.DynamoDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// Route handler for serving home.html
app.get('/home.html', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// Route handler for serving main.html
app.get('/main.html', (req, res) => {
    res.sendFile(__dirname + '/main.html');
});

// Route handler for serving help.html
app.get('/help.html', (req, res) => {
    res.sendFile(__dirname + '/help.html');
});

// Endpoint to retrieve all to-do items from DynamoDB
app.get('/todos', async (req, res) => {
    const params = {
        TableName: 'ToDoList'
    };

    try {
        const data = await dynamodb.scan(params).promise();
        const todoItems = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));
        res.json(todoItems);
    } catch (err) {
        console.error("Error", err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to add a new to-do item to DynamoDB
app.post('/todos', async (req, res) => {
    const { todoText } = req.body;

    if (!todoText) {
        return res.status(400).json({ error: 'Todo text is required' });
    }

    const todoId = uuidv4(); // Generate a unique ID for the to-do item
    const params = {
        TableName: 'ToDoList',
        Item: {
            'BCIT': { S: todoId }, // Partition key
            'id': { S: todoId }, // Unique ID for the to-do item
            'text': { S: todoText }
        }
    };

    try {
        await dynamodb.putItem(params).promise();
        res.status(201).json({ id: todoId, message: 'Todo item added successfully' });
    } catch (err) {
        console.error("Error", err);
        res.status(500).send('Internal Server Error');
    }
});

// Other CRUD endpoints for updating and deleting to-do items

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
