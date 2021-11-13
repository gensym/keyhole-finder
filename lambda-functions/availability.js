
exports.dateRange = function(startDate, length) {
    const endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + length);
    return [startDate, endDate].map((date) => {
        const zonedString = date.toLocaleDateString({timezone: 'America/Los_Angeles'});
        const [month, day, year] = zonedString.split('/');
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    });
}

exports.matchAvailability = function (subscriptions, calendar) {
    const subscribers = subscriptions.reduce((m, subscription) => {
        (m[subscription.subscriber] ||= []).push(subscription.date);
        return m;
    }, {});

    const availableDates = calendar.reduce((dates, date) => {
        const availability = date.availability;
        if (availability !== 'none') {
            dates[date.date] = date.availability;
        }
        return dates;
    }, {});

    return new Set(Object.keys(subscribers).map((subscriber) => {
        return {
            subscriber: subscriber,
            dates: subscribers[subscriber].reduce((availability, date) => {
                if (availableDates[date]) {
                    availability[date] = availableDates[date];
                }
                return availability;
            }, {})
        };
    }));
}