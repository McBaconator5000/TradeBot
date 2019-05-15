const commando = require('discord.js-commando');
const fs = require('fs');
let secretsArray = JSON.parse(fs.readFileSync("./secrets.json", "utf8"));

class lookchannel extends commando.Command{
    constructor(client){
        super(client, {
            name: 'lookcha',
            group: 'admin',
            memberName: 'lookchannel',
            clientPermissions: ['MANAGE_MESSAGES'],
            description: 'sets the looking channel'
        });
    }

    async run(message, args){
        let savedOffCha
        try{
            savedOffCha = secretsArray[message.guild.id].offerchannel
        }catch{
            savedOffCha = ''
        }
        secretsArray[message.guild.id] = {
            offerchannel: savedOffCha,
            lookchannel: message.channel.id,
            name: message.guild.name
        }
        fs.writeFile("./secrets.json", JSON.stringify(secretsArray, null, 2), (err) => {
            if (err) console.error(err)
        });
        message.delete()
        message.channel.send('This is now the looking channel').then(
            msg => {
                msg.delete(2000)
            }
        );
    }
}

module.exports = lookchannel;