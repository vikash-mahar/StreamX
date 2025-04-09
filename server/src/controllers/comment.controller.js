import mongoose, { isValidObjectId } from 'mongoose';
import {Comment} from '../models/comment.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getVideoComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {page=1, limit=10}= req.query

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "no valid video is found")
    }

    const getComments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $sort:{
                createdAt: -1
            }
        },
        {
             $skip: (page-1)*limit
        },
        {
            $limit: parseInt(limit),
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{

                    $project:{
                        username: 1,
                        _id:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $unwind:{
                path:"$owner"
            }
        },
        {
            $lookup:{
               from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                isLiked:{
                    $cond:{
                        if:{$in: [req.user?._id, "$likes.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                username:1,
                avatar:1,
                likesCount:1,
                isLiked:1,
                content:1,
                owner:1,
                createdAt:1
            }
        }
    ])

    // console.log(getComments);

    if(!getComments){
        throw new ApiError(501, "error while fetching comments")
    }

    return res.status(200)
    .json(new ApiResponse(200, getComments, "comments fetched successfully"))


})

const addComment = asyncHandler(async(req,res)=>{
    const {content} = req.body
    const {videoId}= req.params

    if(!content?.trim()){
        throw new ApiError(400," comment cannot be empty")
    }

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id")
    }

    const comment = await Comment.create({
        content,
        owner:req.user?._id,
        video:videoId
    })

    if(!comment){
        throw new ApiError(500,"error while adding comment")
    }

    return res.status(200)
    .json(new ApiResponse(200,comment,"comment added successfully"))

})

const updateComment = asyncHandler(async(req,res)=>{
    const {content} = req.user
    const {commentId} = req.param
    console.log("commentid",commentId)
    console.log("content",content)

    if(!content?.trim()){
        throw new ApiError(400," comment cannot be empty")
    }

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "invalid comment id")
    }

    const comment= await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(500, "comment not found")
    }

    if(comment.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(401,"you do not have permission to update the comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,
        {
            $set:{content}
        },
        {
            new:true
        }
    )

    if(!updatedComment){
        throw new ApiError(500,"error while updating comment")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"))

})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId}= req.params

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "invalid comment id")
    }

    const comment= await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(500, "comment not found")
    }

    if(comment.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(401,"you do not have permission to update the comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(500,"error while deleting comment")
    }
    
    return res.status(200)
    .json(new ApiResponse,(200,deleteComment,"comment deleted successfully"))

    
})

export {
    getVideoComment,
    addComment,
    updateComment,
    deleteComment
}