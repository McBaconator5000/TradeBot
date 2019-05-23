const commando = require('discord.js-commando');
const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
let friendinfo = JSON.parse(fs.readFileSync("./friendlist.json", "utf8"));

class IAmCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'iam',
            group: 'friends',
            memberName: 'iam',
            description: 'Store Friend code, trainer name, and discord name',
            format: '!iam',
            args: [ 
                {
                    key: 'trainerName',
                    prompt: 'What is your trainer name?',
                    type:'string'
                },
                {
                    key: 'friendCode',
                    prompt: 'What is your friend code?',
                    type:'string'
                }
            ]
        });
    }

    async run(message, args){
        friendinfo[message.author.id] = {
            discordName: message.author.username,
            discordTag: message.author.tag,
            trainerName: args.trainerName,
            friendCode: args.friendCode
        }

        fs_writeFile("./friendlist.json", JSON.stringify(friendinfo), (err) => {
            if (err) console.log(err)
        }).then(async function(results){
            message.channel.startTyping()

            message.channel.send("Data saved!")

            message.channel.stopTyping()
        })
            
    }
}

module.exports = IAmCommand;