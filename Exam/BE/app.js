require('dotenv').config()
const express = require ('express');
const path = require('path');
const connectDB = require('./DB/connection');
const allRouter = require ('./Modules/AllRouter');
const app = express();
const cors = require("cors");
const {initIO} = require('./services/socket');
const userModel = require('./DB/Model/user');
const cronJobs = require('./services/CronJob');
app.use(cors())
const port = process.env.PORT;

app.use(express.json());

app.use('/uploads' , express.static(path.join(__dirname , './uploads')))

app.use('/api/v1/user', allRouter.userRouter )
app.use('/api/v1/product', allRouter.productRouter )
app.use('/api/v1/comment', allRouter.commentRouter )




connectDB()
const server = app.listen (port, ()=>{

    console.log("running...");
})

const io  = initIO(server)

io.on('connection' , (socket)=>{

    socket.on("updateSocketID" , async (data)=>{
        await userModel.findByIdAndUpdate(data , {socketID:socket.id})
    })
    console.log(socket.id);
})

cronJobs()