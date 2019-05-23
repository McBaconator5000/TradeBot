const commando = require('discord.js-commando');
const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
let looks = JSON.parse(fs.readFileSync("./looks.json", "utf8"));
const randomString = require('randomstring');
const Jimp = require('jimp');
const func = require('../../functions.js');

class LookingCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'looking',
            group: 'market',
            memberName: 'looking',
            description: 'Places search for item in market',
            format: '!looking',
            args: [
                {
                    key: 'lookingFor',
                    prompt: 'What are you looking for?',
                    type: 'string'
                },
                {
                    key: 'inExchangeFor',
                    prompt: 'What will you give up to find it?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, args){
        const secrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf8'));
        let guildID = message.guild.id;
        let lookchannel = this.client.channels.get(secrets[guildID].lookchannel); 

        //create key for offer
        var marketKey = randomString.generate({
            length: 6,
            charset: "alphabetic"
        });
        //TODO make sure marketKey not already in use
        var color = 0;
        for (var i = 0; i < marketKey.length; i++){
            color += parseInt(marketKey[i].charCodeAt(0).toString(2))
        }


        //build var to save
        looks[marketKey] = {
            lookingFor: args.lookingFor,
            inExchangeFor: args.inExchangeFor,
            traderName: message.author.username,
            traderTag: message.author.tag
        }


        // And then, we save the edited file.
        fs_writeFile("./looks.json", JSON.stringify(looks), (err) => {
            if (err) console.error(err)
        }).then(async function(results){
            //start typing
            message.channel.startTyping()

            //multiple pokemon for looking catcher
            var multiLook = args.lookingFor.split(",")
            var lookShift = (multiLook.length * 10) * -1
            let lookPic = await func.makeImage(multiLook, 'looklook.png')
            //console.log("lookPic sent")

            var multiExch = args.inExchangeFor.split(",")
            var exchaShift = (multiExch.length * 10) * -1
            let inExPic = await func.makeImage(multiExch, 'lookexch.png')
            //console.log("inexchPic sent")


            await Jimp.read('trade-logo.png')
            .then(async baseImg => { //add leftmost pokemon
                //console.log("loading logo ")
                baseImg.scale(0.5) //scale down from 512 by 512 trade icon
                baseImg.opacity(0.80)
                await Jimp.read(lookPic)
                .then(lookingForImg =>{
                    lookingForImg.scale(0.6); //scale down from 256 by 256
                    return baseImg.composite(lookingForImg, lookShift, 108)
                    //.write('lftemp_img.png')
                })
                .then(async baseImg => { //add rightmost pokemon

                    await Jimp.read(inExPic)
                        .then(inExchangeForImg =>{
                            inExchangeForImg.scale(0.6);
                            return baseImg.composite(inExchangeForImg, 108 + exchaShift, 0)
                            .writeAsync('lftemp_img.png')
                            .then(func => {
                                //once the picture is saved then we can print 
                                message.channel.stopTyping()
                                message.channel.send('Added to '+lookchannel);//TODO make this a channel to click
                                const embed = {
                                    "author": {
                                        "name": message.author.username + " wants to trade!",
                                        "icon_url": message.author.displayAvatarURL
                                    },
                                    "color": color,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "text": "Press ❌ to delete #"+marketKey
                                    },
                                    "image": {
                                        "url" : "attachment://lftemp_img.png"
                                    },
                                    "fields":[
                                        {
                                            "name": "Looking For",
                                            "value": args.lookingFor,
                                            "inline": false
                                        },
                                        {
                                            "name": "In Exchange For",
                                            "value": args.inExchangeFor,
                                            "inline": false
                                        }
                                    ]
                                }
                                lookchannel.send(message.author,{
                                    embed,
                                    files: [{
                                        attachment: 'lftemp_img.png',
                                        name: 'lftemp_img.png'
                                    }]
                                }).then(sentMessage => {
                                    sentMessage.react('❌');
                                });

                            })
                        })
                    })
                
            })


            //once file is saved then we can post the picture.


        });
    }
}

module.exports = LookingCommand;