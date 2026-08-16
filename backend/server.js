require('dotenv').config();
const app = require("./src/app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require("./src/service/ai.service");
const { text } = require('stream/consumers');

const httpServer = createServer(app); 
const io = new Server(httpServer, {

    cors:{
        origin: "http://localhost:5173",
    }
  
}); 

const chatHistory = [
    // {
    //     role: "user",
    //     parts: [ { text: 'what is current PM of india?'}]
    // },
    // {
    //     role: "model",
    //     parts: [
    //         {
    //             text: "The current Prime Minister of India is **Narendra Modi**. He assumed office for a third consecutive term on June 9, 2024."
    //         },
    //     ],
    // }
]

io.on("connection", (socket)=> {
    console.log("A user connected")

    socket.on("disconnect",() => {
        console.log("A user disconnect")
    });

    // socket.on("message", async (data)=> {
    //     console.log(data);
    // })

    socket.on("ai-message", async (data) =>{

        console.log("Received AI message:", data);

        chatHistory.push({
            role: "user",
            parts: [{ text: data }]
        });

        const response = await generateResponse(chatHistory);
        // console.log("AI Response:", response);

        chatHistory.push({
            role: "model",
            parts: [ { text: response } ]
        });

        socket.emit("ai-message-response", { response })
    })
     

});

httpServer.listen(3000, () => {
    console.log("server is running on port 3000");
}); 