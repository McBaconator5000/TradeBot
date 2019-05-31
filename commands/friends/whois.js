const  commando = require('discord.js-commando');
const func = require('../../functions.js');
const fs = require('fs');


class WhoIsCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'whois',
            group: 'friends',
            memberName: 'whois',
            description: 'Find Friend code, trainer name, and discord name',
            format: '!whois',
            args: [ 
                {
                    key: 'name',
                    prompt: 'What is the name of the person you are looking for?',
                    type:'string'
                }
            ]
        });
    }


    async run(message, args){
        let name = args.name
        let client = this.client //name client here, will need to use it to find ppl later

        fs.readFile('./friendlist.json', 'utf8', async function(err, contents) {
            if(err) throw err
            let friendlist = JSON.parse(contents) //turn raw data into object
            
            //console.log(friendlist['159112791561601025'].discordName)  //returns discord name of discord user with ID '159.....' <- must be string

            for(var id in friendlist){ //go through all list
                if(friendlist[id].trainerName == name){ //match trainername to name looking for
                    var foundUser = await client.fetchUser(id)
                    await func.respond(message, foundUser, friendlist[id].friendCode)  
                ///all of these are the same... combine to one big OR statement??? separate for now as may need it that way for some reason....
                }else if(friendlist[id].discordName == name){
                    var foundUser = await client.fetchUser(id)
                    await func.respond(message, foundUser, friendlist[id].friendCode)

                }else if(friendlist[id].discordTag.includes(name)){
                    var foundUser = await client.fetchUser(id)
                    await func.respond(message, foundUser, friendlist[id].friendCode)
                }
            }
            if(foundUser == undefined){///hacky way to see if anyone was found.... foundUser is only defined if found so.... :D
                message.channel.send("I counldn't find anyone by that name.")
            }

        })


            
    }
}

module.exports = WhoIsCommand;