const commando = require('discord.js-commando');
const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
let offers = JSON.parse(fs.readFileSync("./offers.json", "utf8"));
let looks = JSON.parse(fs.readFileSync("./looks.json", "utf8"));

class DeleteCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'delete',
            group: 'market',
            memberName: 'delete',
            description: 'Removes an item in market',
            args:[
                {
                    key: 'marketKey',
                    prompt: 'What is the tading code of the trade would like to delete?',
                    type: 'string'
                }
            ]
        });
    }

    async run(message, args){
        const secrets = require('../../secrets.json');
        let offerchannel = this.client.channels.get(secrets.offerchannel); //MULTI
        let lookchannel = this.client.channels.get(secrets.lookchannel); //MULTI

        if(typeof offers[args.marketKey] === 'undefined' && typeof looks[args.marketKey] === 'undefined'){//make sure item exists
            message.channel.send("The requested market item does not exist.")
        }else if(typeof looks[args.marketKey] === 'undefined'){//item exists in offers
            if(offers[args.marketKey].traderTag == message.author.tag || message.member.hasPermission("MANAGE_CHANNELS")){
                delete offers[args.marketKey]
                fs_writeFile("./offers.json", JSON.stringify(offers), (err) => {
                    if (err) console.error(err)
                }).then(function(results){
                    offerchannel.fetchMessages({limit: 100}).then(messages => {
                        messages.filter(messChk =>{
                            if(messChk.embeds[0] != undefined){
                                let footer = messChk.embeds[0].footer.text
                                if(footer.includes(args.marketKey)){
                                    messChk.delete();
                                }

                            }
                        });
                    });
                    message.channel.send("The market item has been deleted.")
                });
            }else{
                message.channel.send("Only the person who created this market item may delete it.")
            }
        }else{//item exists in looks
            if(looks[args.marketKey].traderTag == message.author.tag || message.member.hasPermission("MANAGE_CHANNELS")){
                delete looks[args.marketKey]
                fs_writeFile("./looks.json", JSON.stringify(looks), (err) => {
                    if (err) console.error(err)
                }).then(function(results){
                    lookchannel.fetchMessages({limit: 100}).then(messages => {
                        messages.filter(messChk =>{
                            if(messChk.embeds[0] != undefined){
                                let footer = messChk.embeds[0].footer.text
                                if(footer.includes(args.marketKey)){
                                    messChk.delete();
                                }
                            }
                        });
                    });
                    message.channel.send("The market item has been deleted.")
                });
            }else{
                message.channel.send("Only the person who created this market item may delete it.")
            }
        }//end delete stuff
    }
}

module.exports = DeleteCommand;