const Settings = require('../../models/Settings');
const { google } = require('googleapis');

module.exports = {
    Calendar: {
        // @ts-ignore
        organizer: (calendar) => calendar.organizer.email,
        // @ts-ignore
        start: (calendar) => calendar.start.dateTime.toString(),
        // @ts-ignore
        end: (calendar) => calendar.end.dateTime,
    },
    Query: {

        async getCalendar() {
            const token = await Settings.find();
            console.log("refresh token: ", token[0].refreshtoken);
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URL
            );
            oauth2Client.credentials = ({
                refresh_token: token[0].refreshtoken
            });

            const calendar = google.calendar({version: 'v3', auth: oauth2Client});
            // console.log(calendar);

            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            console.log(response.data.items);
            const events = response.data.items;
            return events;
            // if (!events || events.length === 0) {
            //     console.log('No upcoming events found.');
            //     return;
            // }
            // console.log('Upcoming 10 events:');
            // // @ts-ignore
            // events.map((event, i) => {
            //     const start = event.start.dateTime
            //     console.log(`${start} - ${event.summary}`);
            // });
        }
    },
    Mutation: {
        // @ts-ignore
        async addCalendarEvent<T>(parent: T, { summary, organizer, start, end, status, hangoutLink }) {
            const token = await Settings.find();
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URL
            );
            oauth2Client.credentials = {
                refresh_token: token[0].refreshtoken
            };
            const event = {
                'summary': summary,
                'organizer': {
                    'email': organizer
                },
                'start': {
                    'dateTime': start,
                    'timeZone': 'Europe/Warsaw',
                },
                'end': {
                    'dateTime': end,
                    'timeZone': 'Europe/Warsaw',
                },
                'hangoutLink': hangoutLink
            };
            const calendar = google.calendar({version: 'v3', auth: oauth2Client});
            calendar.events.insert({
                auth: oauth2Client,
                calendarId: 'primary',
                resource: event
            });
            return event;
        }
    }
};