const responseResult = [
    {
        status: 200,
        statusText: 'OK',
        description: 'Server successfully performs client request'
    },
    {
        status: 201,
        statusText: 'Created',
        description: 'Server successfully generates information from client request'
    },
    {
        status: 400,
        statusText: 'Bad Request',
        description: 'Request query or parameter error'

    },
    {
        status: 401,
        statusText: 'Unauthorized',
        description: 'Authentication error'
    },
    {
        status: 403,
        statusText: 'Forbidden',
        description: 'The request wat forwarded to the server, but declined because of permissions'
    },
    {
        status: 500,
        statusText: 'Bad Gateway',
        description: 'Server error'
    }
];

const RESPONSE_ENUM = Object.freeze({
    OK: 0, CREATED: 1, BAD_REQUEST:2, UNAUTHORIZED: 3,
    FORBIDDEN: 4, SERVER_ERROR: 5
});


const jsonResponse = (request, data, status = 200, statusText = 'OK') => {
    const {url, method, params, query, headers: {host, accept}} = request;
    const responseData = {
        status,
        statusText,
        request: {
            url,
            method,
            headers: {
                host,
                accept
            },
            params,
            query
        },
        response: responseResult,
        data
    };
    return responseData;
}

const jsonErrorResponse = (req, error, status = 400, statusText = 'Bad Request') => {
    const {url, method, params, query, headers: {host, accept}} = req;
    console.log(responseResult[error])
    const errorResponse = {
        status,
        statusText,
        request: {
            url,
            method,
            headers: {
                host,
                accept
            },
            params,
            query
        },
        response: responseResult,
        errors: [responseResult[error]]
    }
    return errorResponse;
};

module.exports = {
    RESPONSE_ENUM,
    jsonResponse,
    jsonErrorResponse
};
