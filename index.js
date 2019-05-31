const commando = require('discord.js-commando');
const secrets = require('./secrets.json');
const bot = new commando.Client({
    commandPrefix: "!",
    owner: "159112791561601025"
});
const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
const func = require('./functions.js');
var { TesseractWorker } = require('tesseract.js')
const tessWorker = new TesseractWorker();


bot.registry.registerGroup('market', 'Market');
bot.registry.registerGroup('friends', 'Friends');
bot.registry.registerGroup('admin', 'Admin');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + "/commands");

//put help command as playing
bot.on('ready', () => {
    bot.user.setActivity("For help type: \n !docs")
})


//error catcher
bot.on('error', console.error);


//reaction listener for old messages
bot.on('raw', packet => {
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    // Grab the channel to check the message from
    const channel = bot.channels.get(packet.d.channel_id);
    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.fetchMessage(packet.d.message_id).then(async function (message){
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.get(emoji);
        // Adds the currently reacting user to the reaction's users collection.
        if (reaction) reaction.users.set(packet.d.user_id, bot.users.get(packet.d.user_id));
        // Check which type of event it is before emitting
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            bot.emit('messageReactionAdd', reaction, bot.users.get(packet.d.user_id));
            if(reaction.emoji.name === '❌'){//don't check if user = bot as bot won't add reactions to old stuff anyway
                message = reaction.message;
                user = bot.users.get(packet.d.user_id);
                let member = await message.guild.fetchMember(user);
                
                if(message.content.includes(user) || member.hasPermission("MANAGE_CHANNELS")){//match person reacting to person who set up trade 
                    let guildID = message.guild.id;
                    let offerchannel = bot.channels.get(secrets[guildID].offerchannel); 
                    let lookchannel = bot.channels.get(secrets[guildID].lookchannel);
                    let offers
                    let looks
                    try {
                        offers = JSON.parse(fs.readFileSync("./offers.json", "utf8"));
                        looks = JSON.parse(fs.readFileSync("./looks.json", "utf8"));

                        let footer = message.embeds[0].footer.text 
                        marketKey = footer.substring(footer.length - 6, footer.length) //this market key is wrong
                        //console.log("::" + marketKey + "::");
                        if(typeof looks[marketKey] === 'undefined'){//it's in offers
                            delete offers[marketKey]
                            fs_writeFile("./offers.json", JSON.stringify(offers), (err) => {
                                if (err) console.error(err)
                            }).then(function(results){
                                offerchannel.fetchMessages({limit: 100}).then(messages => {
                                    messages.filter(messChk =>{
                                        if(messChk.embeds[0] != undefined){
                                            let footer = messChk.embeds[0].footer.text 
                                            if(footer.includes(marketKey)){ 
                                                messChk.delete();
                                                message.channel.send("The market item has been deleted.").then(
                                                    msg => {
                                                        msg.delete(2000)
                                                    });
                                            }
                                        }
                                    });
                                });
                            });
                        }else if(typeof offers[marketKey] === 'undefined'){
                            delete looks[marketKey]
                            fs_writeFile("./looks.json", JSON.stringify(looks), (err) => {
                                if (err) console.error(err)
                            }).then(function(results){
                                lookchannel.fetchMessages({limit: 100}).then(messages => {
                                    messages.filter(messChk =>{
                                        if(messChk.embeds[0] != undefined){
                                            let footer = messChk.embeds[0].footer.text 
                                            if(footer.includes(marketKey)){
                                                messChk.delete();
                                                message.channel.send("The market item has been deleted.").then(
                                                    msg => {
                                                        msg.delete(2000)
                                                    });
                                            }
                                        }
                                    });
                                });
                            });
                        }

                    }catch (e){
                        console.log("already parsed json")
                    }
                }

            }
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            bot.emit('messageReactionRemove', reaction, bot.users.get(packet.d.user_id));
            //console.log("uncached reaction removed");
        }
    });
});


//reaction listener
bot.on('messageReactionAdd', async function(reaction, user) {
    if(reaction.emoji.name === '❌' && !user.bot){//ensure one adding X is not bot
        message = reaction.message;
        //console.log("reaction by " + user.id);
        let member = await message.guild.fetchMember(user);
        //console.log("reaction by member " + member);
        if(message.content.includes(user)|| member.hasPermission("MANAGE_CHANNELS")){//match person reacting to person who set up trade
            //delete listing code
            let guildID = message.guild.id;
            let offerchannel = bot.channels.get(secrets[guildID].offerchannel); 
            let lookchannel = bot.channels.get(secrets[guildID].lookchannel);
            let offers = JSON.parse(fs.readFileSync("./offers.json", "utf8"));
            let looks = JSON.parse(fs.readFileSync("./looks.json", "utf8"));
            let footer = message.embeds[0].footer.text 
            marketKey = footer.substring(footer.length - 6, footer.length) //this is marketkey
            //console.log("reaction by " + marketKey);
            if(typeof looks[marketKey] === 'undefined'){//it's in offers
                delete offers[marketKey]
                fs_writeFile("./offers.json", JSON.stringify(offers), (err) => {
                    if (err) console.error(err)
                }).then(function(results){
                    offerchannel.fetchMessages({limit: 100}).then(messages => {
                        messages.filter(messChk =>{
                            if(messChk.embeds[0] != undefined){
                                let footer = messChk.embeds[0].footer.text
                                if(footer.includes(marketKey)){
                                    messChk.delete();
                                    message.channel.send("The market item has been deleted.").then(
                                        msg => {
                                            msg.delete(2000)
                                        });
                                }
                            }
                        });
                    });
                });
            }else if(typeof offers[marketKey] === 'undefined'){
                delete looks[marketKey]
                fs_writeFile("./looks.json", JSON.stringify(looks), (err) => {
                    if (err) console.error(err)
                }).then(function(results){
                    lookchannel.fetchMessages({limit: 100}).then(messages => {
                        messages.filter(messChk =>{
                            if(messChk.embeds[0] != undefined){
                                let footer = messChk.embeds[0].footer.text
                                if(footer.includes(marketKey)){
                                    messChk.delete();
                                    message.channel.send("The market item has been deleted.").then(
                                        msg => {
                                            msg.delete(2000)
                                        });
                                }
                            }
                        });
                    });
                });
            }
        }
    }
});

//message listener - for reading screenshots
bot.on('message', async function(message){

    if(message.attachments.first() != undefined && !message.author.bot){//check to see if message has attachment
        let friendinfo = JSON.parse(fs.readFileSync("./friendlist.json", "utf8"));
        message.channel.startTyping()
        var screenshot = message.attachments.first()
        tessWorker.recognize(screenshot.url)
            .progress(function  (p) { 
                //console.log('progress', p)  ///won't need this eventually
                ///send message informing of processing
            })
            .catch(err => console.error(err))
            .then(function (result) {
                var friendCode =  func.findCode(result.text)
                var trainerName = func.findIGN(result.text)
                //console.log(trainerName + " : " + fcode)
                ///put functions for parsing result.text here

                friendinfo[message.author.id] = {
                    discordName: message.author.username,
                    discordTag: message.author.tag,
                    trainerName: trainerName,
                    friendCode: friendCode
                }

                fs_writeFile("./friendlist.json", JSON.stringify(friendinfo), (err) => {
                    if (err) console.log(err)
                }).then(function(results){
                    
                    message.channel.send("I have your trainer name saved as: `"+ trainerName + "` and your friend code saved as: `" + friendCode +
                    "`\n If this is incorrect please use the `!iam` function to manually enter the correct data")
        
                    message.channel.stopTyping()
                })

            })
    }
})



bot.login(secrets.token);