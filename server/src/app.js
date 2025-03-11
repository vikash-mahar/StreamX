import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json({limit:"200mb"}))
app.use(express.urlencoded({extended:true,limit :"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())




import userRouter from './routes/user.routes.js'
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import playlistRouter from "./routes/playlist.router.js";
import healthcheckRouter from "./routes/healthcheck.router.js";
import dashboardRouter from "./routes/dashboard.router.js";

app.get("/", (req, res) => res.send("Backend of Streamify"));

app.use("/api/v1/users",userRouter)
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export{app};