const commando = require('discord.js-commando');
const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
const randomString = require('randomstring');
let offers = JSON.parse(fs.readFileSync("./offers.json", "utf8"));
const func = require('../../functions.js');
const Jimp = require('jimp');

class OfferCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'offer',
            group: 'market',
            memberName: 'offer',
            description: 'Places item in market',
            format: '!offer',
            args: [
                {
                    key: 'offering',
                    prompt: 'What are you offering up?',
                    type:'string'
                },
                {
                    key: 'inExchangeFor',
                    prompt: 'What would you like in return?',
                    type:'string'
                }
            ]
        });
    }

    async run(message, args){
        const secrets = JSON.parse(fs.readFileSync('./secrets.json', 'utf8'));
        let guildID = message.guild.id;
        let offerchannel = this.client.channels.get(secrets[guildID].offerchannel); //MULTI

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
        offers[marketKey] = {
            offering: args.offering,
            inExchangeFor: args.inExchangeFor,
            traderName: message.author.username,
            traderTag: message.author.tag
        }


        // And then, we save the edited file.
        fs_writeFile("./offers.json", JSON.stringify(offers), (err) => {
            if (err) console.error(err)
        }).then(async function(results){

            //start typing
            message.channel.startTyping()
            
            var multiOffer = args.offering.split(",")
            var offShift = (multiOffer.length * 10) * -1
            let offPic = await func.makeImage(multiOffer, 'offoff.png')

            var multiExch = args.inExchangeFor.split(",")
            var exchaShift = (multiExch.length * 10) * -1
            let inExPic = await func.makeImage(multiExch, 'offexch.png')

            //once file is saved then we can post the picture.
            await Jimp.read('trade-logo.png')
            .then(async baseImg => { //add leftmost pokemon
                baseImg.scale(0.5) //scale down from 512 by 512 trade icon
                baseImg.opacity(0.80)
                await Jimp.read(offPic)
                .then(offerImg =>{
                    offerImg.scale(0.6); //scale down from 256 by 256
                    return baseImg.composite(offerImg, offShift, 108)
                    //.write('lftemp_img.png')
                })
                .then(async baseImg => { //add rightmost pokemon

                    await Jimp.read(inExPic)
                        .then(inExchangeForImg =>{
                            inExchangeForImg.scale(0.6);
                            return baseImg.composite(inExchangeForImg, 108 + exchaShift, 0)
                            .writeAsync('oftemp_img.png')
                            .then(func => {
                                //once the picture is saved then we can print
                                message.channel.stopTyping() 
                                message.channel.send('Added to '+offerchannel);//TODO make this a channel to click
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
                                        "url" : "attachment://oftemp_img.png"
                                    },
                                    "fields":[
                                        {
                                            "name": "Offering",
                                            "value": args.offering,
                                            "inline": false
                                        },
                                        {
                                            "name": "In Exchange For",
                                            "value": args.inExchangeFor,
                                            "inline": false
                                        }
                                    ]
                                }
                                offerchannel.send(message.author,{
                                    embed,
                                    files: [{
                                        attachment: 'oftemp_img.png',
                                        name: 'oftemp_img.png'
                                    }]
                                }).then(sentMessage => {
                                    sentMessage.react('❌');
                                });

                            })
                        })
                    })
                
            })

                



        });
    }
}

module.exports = OfferCommand;