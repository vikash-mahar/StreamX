import mongoose, {isValidObjectId} from "mongoose";
import {user} from "../models/user.model.js";
import { subscription } from "../models/subcription.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req,res)=>{
    const {channelId}= req.params

    if(!channelId||!isValidObjectId(channelId)){
        throw new ApiError(500,"error while getting channel")
    }

    if(channelId.toString()=== req.user?._id.toString()){
        throw new ApiError(403,"cannot subscribe to ur own channel")
    }

    const isSubscribed= await Subscription.findOne({
        channel:channelId,
        subscriber:req.user?._id
    })

    if(isSubscribed){
        const unSubscribed = await Subscription.findByIdAndDelete(isSubscribed?._id)
        if(!unSubscribed){
            throw new ApiError(500,"error while unsubscribing channel")
        }
    }
    else{
        const subscribe= await Subscription.create({
            channel:channelId,
            subscriber:req.user?._id
        })
        if(!subscribe){
            throw new ApiError(500,"error while subscribing channel")
        }
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"subscribe status updated"))
})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"channel id is not valid")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from :"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            avatar:1,
                            fullName:1,
                            username:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscribers:{
                    $first:"$subscribers"
                }
            }
        },
        {
            $group:{
                _id:null,
                subscribers:{
                    $push:"subscribers"
                },
                totalSubscribers:{
                    $sum:1
                }
            }
        },{
            $project:{
                subscribersCount:"$totalSubscribers"
            }
        }
    ])

    if(!subscribers){
        throw new ApiError(500,"error while getting subscribers")
    }

    return res.status(200)
    .json(new ApiResponse(200,subscribers,"subscribers fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params

    if (!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "No valid subscriber Id found");
    }

    const SubscribedChannels = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channelDetails",
            }
        },
        {
            $unwind:"channelDetails"
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"channel",
                foreignField:"channel",
                as:"channelSubscribers"
            }
        },
        {
            $addFields:{
                "channelDetail.isSubscribed":{
                    $cond:{
                        if:{$in:[new mongoose.Types.ObjectId(req.user?._id),"$channelDetail.isSubscribed"]},
                        then:true,
                        else:false
                    }
                },
                "channelDetail.isSubscribed":{
                    $size:"$channelSubscribers"
                }
            }
        },
        {
            $group:{
                _id:null,
                channels:{
                    $push:"$channelDetails"
                },
                totalChannels:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                channel:{
                    _id:1,
                    isSubscribed:1,
                    subscribersCount:1,
                    fullName:1,
                    avatar:1,
                    username:1
                },
                channelsCount:"$totalChannels"
            }
        }
    ])

    if(!SubscribedChannels){
        throw new ApiError(500,"channels not found")
    }

    return res.status(200)
    .json(new ApiResponse(200,SubscribedChannels[0],"subscribed channel fetched successfully"))
})

export{
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers,
}