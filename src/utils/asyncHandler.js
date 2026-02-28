const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err)) // meaning os Promise word here is that it takes the result of the requestHandler function, which is expected to be a promise (since it's an async function), and if that promise is rejected (i.e., if an error occurs), it catches the error and passes it to the next middleware in the Express.js pipeline using next(err). This allows for centralized error handling in your Express application, as any errors thrown in the async request handlers will be properly caught and handled by your error-handling middleware.
    }
}


export { asyncHandler }




// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }