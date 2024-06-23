const express = require('express');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const socketIO = require('socket.io');

const mongoose = require('mongoose');
mongoose.connect(process.env.URI);

const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

// Configuration de Swagger
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
                url: `${process.env.URL}${port}`,
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

// Initialisation de swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/user', userRoutes);

app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});

const Message = require('./models/message');

const io = socketIO(httpsServer, {
    cors: {
      origin: [process.env.SOCKET_CLIENT_URL, process.env.SOCKET_CLIENT_URL2],
      methods: ["GET", "POST"],
    },
  });
  
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
  
    socket.on("join_room", async (data) => {
      try {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
        // Récupérer tous les messages de la salle de discussion depuis la base de données
        const messageHistory = await Message.find({ room: data });
        // Envoyer l'historique des messages de l'utilisateur rejoignant la salle
        socket.emit("message_history", messageHistory);
        console.log(messageHistory);
      } catch (err) {
        console.error("Error fetching message history:", err);
      }
    });
  
    socket.on("send_message", async (data) => {
      // Créer une instance du modèle Message avec les données du message
      const newMessage = new Message({
        room: data.room,
        author: data.author,
        content: data.content,
        time: data.time,
      });
      // Enregistrer le message dans la base de données
      await newMessage.save();
      socket.to(data.room).emit("receive_message", data);
      console.log(data);
    });
  
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
});
