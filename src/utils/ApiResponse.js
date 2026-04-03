class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode // this means the HTTP status code of the response, which indicates whether the request was successful or if there was an error. For example, a status code of 200 indicates success, while a status code of 400 indicates a bad request.
        this.data = data // this.something , where this is the instance of the ApiResponse class and something is the name of the property that holds the actual data being sent back to the client. This allows you to structure your API responses in a consistent way, making it easier for clients to parse and understand the data they receive.
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }