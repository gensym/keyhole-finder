
exports.addDays = function (dateString, toAdd) {
    const startDate = new Date(dateString);
    startDate.setUTCDate(startDate.getUTCDate() + toAdd);
    return startDate.toISOString().substring(0, 10);
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