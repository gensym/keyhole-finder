const http2 = require('http2');
const zlib = require("zlib");

exports.getAvailabilityCalendar = async (startDate, endDate) => {
    client = http2.connect('https://disneyland.disney.go.com');
    req = client.request({
        ':path' : `/availability-calendar/api/calendar?segment=ap&startDate=${startDate}&endDate=${endDate}`,
        'content-type': 'application/json',
        'pragma': 'no-cache',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'no-cache',
        'accept-language': 'en-us',
        'user-ugent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'referer': 'https://disneyland.disney.go.com/availability-calendar/?segments=ticket,ph,ap,resort&defaultSegment=ap'
    });

    data = []
    expander = input => input;
    req.on('response', response => {
        switch (response['content-encoding']) {
            case 'deflate':
                expander = zlib.inflateSync; break;
            case 'gzip':
                expander = zlib.gunzipSync; break;
        }
    });

    let promise = new Promise((resolve) => {
        req.on('end', (r) => {
            var buffer = Buffer.concat(data);
            client.destroy();
            resolve(expander(buffer).toString('utf8'));
        });
    })
    req.on('data', d => data.push(d))
    req.end();
    const result = await promise;
    return JSON.parse(result);
}