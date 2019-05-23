const commando = require('discord.js-commando');
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

        fs.readFile('./friendlist.json', 'utf8', function(err, contents) {
            if(err) throw err
            let friendlist = JSON.parse(contents) //turn raw data into object
            
            //console.log(friendlist['159112791561601025'].discordName)  //returns discord name of discord user with ID '159.....' <- must be string

            for(var id in friendlist){ //go through all list
                if(friendlist[id].trainerName == name){ //match trainername to name looking for
                    console.log("Found " + id)
                } //add other if statements for matching other things
            }

        })


            
    }
}

module.exports = WhoIsCommand;