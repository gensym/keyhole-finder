const {getAvailabilityCalendar} = require('./availability_client');
const {getSubscriptions, removeSubscription} = require('./subscriptions');
const {sendMessage} = require('./messenger');

exports.dateRange = (startDate, length) => {
    const endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + length);
    return [startDate, endDate].map((date) => {
        const zonedString = date.toLocaleDateString({timezone: 'America/Los_Angeles'});
        const [month, day, year] = zonedString.split('/');
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    });
}

exports.matchAvailability = (subscriptions, calendar) => {
    const subscribers = subscriptions.reduce((m, subscription) => {
        if (!m[subscription.subscriber]) {
            m[subscription.subscriber] = [];
        }
        m[subscription.subscriber].push(subscription.date);
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

const onMatch = (subscriber, date, type) => {
    return Promise.all([
        sendMessage(subscriber, `Found availability on ${date} (${type})`),
        removeSubscription(subscriber, date)]);
}

exports.checkAvailability = async (event, context) => {
    let [startDate, endDate] = module.exports.dateRange(new Date(), 90);
    const calendar = await getAvailabilityCalendar(startDate, endDate);
    const subscriptions = await getSubscriptions(startDate, endDate);
    const matches = module.exports.matchAvailability(subscriptions, calendar);
    const results = await Promise.all(Array.from(matches).map((match) => {
        return Promise.all(Object.keys(match.dates).map((date) => {
            const type = match.dates[date];
            return onMatch(match.subscriber, date, type);
        }));
    }));
    return results;
};