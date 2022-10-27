const Settings = require('../../models/Settings');
const { google } = require('googleapis');



module.exports = {
    Query: {

        async getCalendar() {
            const token = await Settings.find();
            console.log("refresh token: ", token[0].refreshtoken);
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URL
            );
            oauth2Client.setCredentials = ({
                refreshtoken: token[0].refreshtoken
            });

            const calendar = google.calendar({version: 'v3', auth: oauth2Client});
            console.log(calendar);

            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            console.log(response.data);
            // const events = response.data.items;
            // if (!events || events.length === 0) {
            //     console.log('No upcoming events found.');
            //     return;
            // }
            // console.log('Upcoming 10 events:');
            // // @ts-ignore
            // events.map((event, i) => {
            //     const start = event.start.dateTime || event.start.date;
            //     console.log(`${start} - ${event.summary}`);
            // });
        }
    }
};