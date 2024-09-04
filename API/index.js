// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const socketIO = require('socket.io');
const http = require('http');
const { getGFS, initializeGFS } = require('./gfsSetup'); // Importer depuis gfsSetup.js
const userRoutes = require('./routes/userRoutes');
const toolRoutes = require('./routes/toolRoutes');
const trousseauRoutes = require('./routes/trousseauRoutes');
const elementRoutes = require('./routes/elementRoutes');
const upload = require('./upload');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongodb:27017/supwarden?authSource=admin`);
//mongoose.connect('mongodb://localhost:27017/supwarden');

const port = 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SUPWARDEN',
            version: '1.0.0',
            description: 'Documentation API SUPWARDEN',
        },
        servers: [
            {
                url: `http://localhost:3001`,
                description: 'Serveur API',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/user', userRoutes);
app.use('/api/tool', toolRoutes);
app.use('/api/trousseau', trousseauRoutes);
app.use('/api/element', elementRoutes);

// Socket.IO configuration
const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const Message = require('./models/message');
const User = require('./models/user');
const Conversation = require('./models/conversation');

app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({ participants: userId }).populate('participants', 'pseudo');
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
    }
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("get_conversations", async (userId) => {
        try {
            const conversations = await Conversation.find({ participants: userId }).populate('participants', 'pseudo');
            socket.emit("conversations", conversations);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        }
    });

    socket.on("join_room", async (data) => {
        try {
            socket.join(data.room);
            console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
            const messageHistory = await Message.find({ room: data.room });
            socket.emit("message_history", messageHistory);
        } catch (err) {
            console.error("Error fetching message history:", err);
        }
    });

    socket.on("send_message", async (data) => {
        const newMessage = new Message({
            room: data.room,
            author: data.author,
            content: data.content,
            time: data.time,
        });
        await newMessage.save();
        socket.to(data.room).emit("receive_message", data);
        console.log(data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(port, async () => {
    try {
        await initializeGFS; // Assurez-vous que GridFS est initialisé
        console.log(`API and Socket.IO server are running on port ${port}`);
    } catch (error) {
        console.error('Error initializing GridFS:', error);
    }
});

module.exports = { getGFS, initializeGFS };
