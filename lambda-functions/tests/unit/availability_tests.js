const assert = require('chai').assert;
const availability = require('../../availability');

describe('availability', () => {

    describe("addDays", () => {
        it("Should rollover to the next month", () => {
           const dateString = "2022-01-20";
           assert.equal("2022-02-01", availability.addDays(dateString, 12));
        });

        it("Should rollover to the next year", () => {
            const dateString = "2022-11-20";
            assert.equal("2023-01-20", availability.addDays(dateString, 61));
        });

    });

   describe('matchAvailability', () => {
       it("should find available dates", () => {
           const subscriptions = [
               {subscriber: "713-219-5025", date: "2022-01-08"},
               {subscriber: "713-219-5025", date: "2022-01-15"},
               {subscriber: "713-219-5025", date: "2022-01-16"},
               {subscriber: "773-768-5309", date: "2022-01-01"},
               {subscriber: "773-768-5309", date: "2022-01-02"}
           ];

           const availableDates = [
               {date: "2022-01-01", availability: "none", parks: []},
               {date: "2022-01-02", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-03", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-04", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-05", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-06", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-07", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-08", availability: "none", parks: []},
               {date: "2022-01-09", availability: "dlr_ca", parks: ["DLR_CA"]},
               {date: "2022-01-10", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-11", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-12", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-13", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-14", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-15", availability: "dlr_ca", parks: ["DLR_CA"]},
               {date: "2022-01-16", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-17", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-18", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-19", availability: "full", parks: ["DLR_CA", "DLR_DP"]},
               {date: "2022-01-20", availability: "full", parks: ["DLR_CA", "DLR_DP"]}];

           assert.deepEqual(new Set([
               { subscriber: "713-219-5025", dates: {"2022-01-15": "dlr_ca", "2022-01-16": "full"} },
               { subscriber: "773-768-5309", dates: {"2022-01-02": "full"}}]),
               availability.matchAvailability(subscriptions, availableDates));
       });
   })
});

