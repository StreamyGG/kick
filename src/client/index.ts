import puppeteer from 'puppeteer';
import { Events, Kient } from 'kient';
import { EMAIL, USERNAME, PASSWORD } from '../config';
import { createClient } from 'redis';

const redisClient = createClient();

const init = async () => {
    await redisClient.connect();

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://kick.com', { waitUntil: 'networkidle0' });

    const isLoggedOut = await page.$('input[name="email"]') !== null;

    if (isLoggedOut) {
        console.log("Login form detected, logging in...");
        await page.type('input[name="email"]', EMAIL!);
        await page.type('input[name="password"]', PASSWORD!);

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        console.log("Login successful.");
    } else {
        console.log("Already logged in.");
    }

    await browser.close();

    const client = await Kient.create();
    const channel = await client.api.channel.getChannel("xqc");

    await channel.connectToChatroom();

    client.on(Events.Chatroom.Message, async (messageInstance) => {
        const message = messageInstance.data;

        const data = {
            streamy: {
                platform: "kick",
                account: {
                    username: USERNAME,
                }
            },
            sender: {
                id: message.sender.id,
                username: message.sender.slug,
                color: message.sender.identity.color,
                badges: message.sender.identity.badges,
                displayName: message.sender.username,
            },
            message: { 
                content: message.content,
                id: message.id,
                createdAt: message.created_at,
            }
        };

            await redisClient.publish('chat', JSON.stringify(data));
    });
};

export default { init };