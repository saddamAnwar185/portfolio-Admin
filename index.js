const express = require('express')
const connectDB = require('./lib/connection')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
require('dotenv').config()
const path = require("path");


const app = express()
const port = process.env.PORT || 5000
connectDB()

// middlewares
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173"
}))
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 4.5 * 1024 * 1024 },
    abortOnLimit: true,
  })
);
app.use(express.static(path.join(__dirname, "dist")));

// routes
const PasswordRoute = require('./Views/PasswordRoute')
const ProjectsRoute = require('./Views/ProjectsRoute')
const ReviewsRoute = require('./Views/ReviewsRoute')


app.use('/api', PasswordRoute)
app.use('/api', ProjectsRoute)
app.use('/api', ReviewsRoute)



app.get("/*splat", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(port, () => {console.log(`http://localhost:${port}`)})
