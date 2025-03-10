import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";

const router = Router();

router.route("/c/:channelId")
router.get(verifyJWT, getUserChannelSubscribers)
router.post(verifyJWT, toggleSubscription);

router.route("/u/:subscriberId").get(checkUser, getSubscribedChannels);

export default router;