const commando = require('discord.js-commando');
const costumes = require('../../costume.json');


class CostumeCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'costume',
            group: 'market',
            memberName: 'costume',
            description: 'Returns all costume possiblities',
            format: '!costume'
        });
    }

    async run(message){
        var costumeNames = "";
        for(var num in costumes){
            //console.log(costumes[num].names)
            var costObj = costumes[num];
            for(var i = 0; i < costObj.names.length; i++){
                costumeNames += costObj.names[i]
                if (costObj.ishat == 'true'){
                    costumeNames += " hat, "
                }else{
                    costumeNames += ", "
                }
            }
        }
        //console.log(costumeNames)
        costumeNames = costumeNames.substring(0, costumeNames.length - 2)
        costumeNames += "."
        message.channel.send("I currently know these costumes: "+costumeNames);
    }
}

module.exports = CostumeCommand;