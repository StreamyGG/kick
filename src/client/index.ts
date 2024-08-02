import { Events, Kient } from 'kient'
import { EMAIL, PASSWORD } from '../config';

const init = async () => {
    const client = await Kient.create()

    const channel = await client.api.channel.getChannel("uddernonsense")
 
    // await channel.connectToChatroom()

    // client.on(Events.Chatroom.Message, (messageInstance) => {
    //   const message = messageInstance.data
    //   console.log(`${message.sender.username}: ${message.content}`)
    // })

};

export default { init };