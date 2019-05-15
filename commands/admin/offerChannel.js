const commando = require('discord.js-commando');
const fs = require('fs');
let secretsArray = JSON.parse(fs.readFileSync("./secrets.json", "utf8"));

class offerchannel extends commando.Command{
    constructor(client){
        super(client, {
            name: 'offcha',
            group: 'admin',
            memberName: 'offerchannel',
            clientPermissions: ['MANAGE_MESSAGES'],
            description: 'sets the offer channel'
        });
    }

    async run(message, args){
        let savedLookCha
        try{
            savedLookCha = secretsArray[message.guild.id].lookchannel
        }catch{
            savedLookCha = ''
        }
        secretsArray[message.guild.id] = {
            offerchannel: message.channel.id,
            lookchannel: savedLookCha,
            name: message.guild.name
        }
        fs.writeFile("./secrets.json", JSON.stringify(secretsArray, null, 2), (err) => {
            if (err) console.error(err)
        });
        message.delete()
        message.channel.send('This is now the Offering channel').then(
            msg => {
                msg.delete(2000)
            }
        );
    }
}

module.exports = offerchannel;