// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) =>
//             next(err)
//         );
//     };
// };

// export { asyncHandler };

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            // Run the async request handler
            await requestHandler(req, res, next);
        } catch (err) {
            // If an error occurs, pass it to the next middleware
            next(err);
        }
    };
};

export { asyncHandler };



/*
const asyncHandler = (fn) => async(req,res,next) => {
    try{
        await fn(req,res,next)
    }
    catch(error){
        res.status(err.code||500).json({
            success:false,
            message:err.message
        })
    }
}
export {asyncHandler}
*/