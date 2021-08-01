exports.jsonResponse = (request, data, status = 200, statusText = 'OK') => {
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
        data
    };
    return responseData;
}