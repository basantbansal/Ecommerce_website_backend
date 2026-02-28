class ApiError extends Error {
    constructor( // this tells us that when we create a new instance of ApiError, we need to provide these parameters. The constructor function is called when we create a new instance of the class, and it initializes the properties of the instance based on the provided parameters.
        statusCode, 
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) // this calls the constructor of the parent class (Error) and passes the message parameter to it. This is necessary to properly set up the error message and other properties inherited from the Error class.
        this.statusCode = statusCode // this sets the statusCode property of the ApiError instance to the value provided when creating the instance. This status code can be used to indicate the type of error (e.g., 400 for bad request, 500 for internal server error, etc.).
        this.data = null // this initializes the data property to null. This property can be used to store any additional data related to the error, such as validation errors or other relevant information.
        this.message = message // this sets the message property of the ApiError instance to the value provided when creating the instance. This message can be used to provide a human-readable description of the error.
        this.success = false; // this sets the success property to false, indicating that the operation that caused the error was not successful. This can be useful for consistent error handling in the application.
        this.errors = errors // this sets the errors property to the value provided when creating the instance. This property can be used to store an array of specific error details, such as validation errors or other relevant information that can help in debugging or providing more context about the error.

        if (stack) {
            this.stack = stack // this checks if a stack trace is provided when creating the instance. If it is, it sets the stack property of the ApiError instance to the provided stack trace. This can be useful for debugging purposes, as it allows you to see where the error occurred in the code.
        } else{
            Error.captureStackTrace(this, this.constructor) // if no stack trace is provided, this line captures the current stack trace and associates it with the ApiError instance. This is a common practice in custom error classes to ensure that the stack trace is properly captured and can be used for debugging.
        }

    }
}

export {ApiError} 

