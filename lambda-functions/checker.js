const https = require('https');
const http2 = require('http2');
const zlib = require("zlib");


async function getIt() {
    const startDate = '2021-11-15';
    const endDate =   '2021-12-31';
    const searchParams = new URLSearchParams({segment: 'ap', 'startDate': startDate, endDate: 'endDate'});
    client = http2.connect('https://disneyland.disney.go.com');
    // client.on('error', (err) => console.error(err))
///        ':path': '/availability-calendar/api/calendar?' + searchParams.toString(),
    req = client.request({
        ':path' : '/availability-calendar/api/calendar?segment=ap&startDate=2021-11-15&endDate=2021-12-31',
        'content-type': 'application/json',
        'pragma': 'no-cache',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'no-cache',
        'accept-language': 'en-us',
        'user-ugent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'referer': 'https://disneyland.disney.go.com/availability-calendar/?segments=ticket,ph,ap,resort&defaultSegment=ap'
    }); undefined;

    data = []
    expander = input => input;
    req.on('response', response => {
        // console.log('RESP:' + response)
        switch (response['content-encoding']) {
            case 'deflate':
                expander = zlib.inflateSync; break;
            case 'gzip':
                expander = zlib.gunzipSync; break;
        }
    }); undefined;

    let promise = new Promise((resolve) => {
        req.on('end', (r) => {
            var buffer = Buffer.concat(data);
            client.destroy();
            resolve(expander(buffer).toString('utf8'));
        });
    })
    req.on('data', d => data.push(d))
    req.end();
    return await promise;
}

// exports.check = async (event, context) => {
// x = await getIt()
//
// }