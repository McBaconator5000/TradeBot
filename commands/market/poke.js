const commando = require('discord.js-commando');
const func = require('../../functions.js');
const Jimp = require('jimp');

class PokeCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'poke',
            group: 'market',
            memberName: 'poke',
            description: 'Returns picture of a pokemon',
            format: '!poke',
            args: [ 
                {
                    key: 'pokeStr',
                    prompt: 'What Pokemon is it?',
                    type:'string'
                }
            ]
        });
    }

    async run(message, args){
        let pokePic = await func.getImage(args.pokeStr);
        Jimp.read(pokePic)
            .then(image => {
                return image
                //.invert()
                .writeAsync('temp_img.png')
                .then(func =>{//after image is written send it
                    message.channel.send("Here's what it looks like", {files:['temp_img.png']})
                    //could delete image here, but really no need. we just overwrite it
                })
            }).catch(err => {
                console.log(err);
            })
            
    }
}

module.exports = PokeCommand;