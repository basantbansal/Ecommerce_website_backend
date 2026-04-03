const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err)) // meaning of Promise word here is that it takes the result of the requestHandler function, which is expected to be a promise (since it's an async function), and if that promise is rejected (i.e., if an error occurs), it catches the error and passes it to the next middleware in the Express.js pipeline using next(err). This allows for centralized error handling in your Express application, as any errors thrown in the async request handlers will be properly caught and handled by your error-handling middleware. what promise word means here like why eaxctly are we using "Promise" ,like are we promising anyone to do anything or is it just a syntax or something else? its , also why onyl this is being used for async functions and not for normal functions, like why do we need to use this for async functions only and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions and not for normal functions, like if we have a normal function that throws an error then why do we not need to catch it using this asyncHandler, like why is it only used for async functions so the answer is that in JavaScript, when you have an asynchronous function (marked with async), it returns a promise. If an error is thrown inside an async function, it will reject the promise. If you don't catch that rejection, it can lead to unhandled promise rejections, which can crash your application or lead to unexpected behavior. By using this asyncHandler, you ensure that any errors thrown in the async request handlers are properly caught and passed to the next middleware for centralized error handling. In contrast, for normal synchronous functions, if an error is thrown, it will be caught by the standard try-catch mechanism in JavaScript, and you can handle it directly without needing a special wrapper like asyncHandler. 
    } // next(err)  ← passes error to Express error handler , which is a middleware function that takes four arguments (err, req, res, next) and is responsible for sending an appropriate response to the client when an error occurs. By using asyncHandler, you can ensure that any errors thrown in your asynchronous request handlers are properly caught and handled by your Express error-handling middleware, providing a consistent way to manage errors across your application.
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