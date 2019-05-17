const commando = require('discord.js-commando');
const { Embeds: EmbedsMode }= require('discord-paginationembed');
const { RichEmbed } = require('discord.js');


class DocsCommand extends commando.Command{
    constructor(client){
        super(client, {
            name: 'docs',
            group: 'market',
            memberName: 'docs',
            description: 'Shows pagination view of help menu',
            format: '!docs'
        });
    }

    async run(message){
        //console.log("here")
        const embeds = [];

        // You can set per RichEmbed properties here instead of globally below

        embeds.push(new RichEmbed().addField('Page', 1) //build page 1
                .setTitle("**__How to use TradeBot__**")
                .setDescription("Looking for a specific pokemon? Type:```!looking``` and follow the prompts \n\n"+
                "Want to offer up as specific pokemon? Type ```!offer``` and follow the prompts")
                );

        embeds.push(new RichEmbed().addField('Page', 2) //build page 2
                .setTitle("**__Advanced Options__**")
                .setDescription("You can offer/look for multiple pokemon, simply separate them with a comma (,) i.e.\n"+
                "```charmander, bulbasaur```\n"+
                "The following `modifiers` can be used, in any order; just be sure that the pokemon name comes __last__.\n\n"+
                "Request a shiny by typing `shiny` before a pokemon. i.e. ```shiny beldum```\n"+
                "Specify alolan by typing `alolan` or `alola` before the pokemon i.e. ```alolan grimer```\n"+
                "Ask for a specific gender by typing `male` or `female` before the pokemon i.e.```female snorunt```\n"+
                "Specify a costume by writing the costume name before the pokemon i.e.```flower crown eevee```\n"+
                " (the list of costume names can be seen with the `!costume` command)\n\n"+
                "These modifiers can be combined in any order, so feel free to ask for a `shiny female alolan marowak`\n\n"+
                "Moves can be specified in the same manner (but will not adjust the listing photo)\n\n"+
                "Once again, be sure the pokemon name is __last__ word in your command.")
                );

        embeds.push(new RichEmbed().addField('Page', 3) //build page 3
                .setTitle("**__Misc Commands__**")
                .setDescription("Want to see what a pokemon looks like? Type `!poke` followed by the name of the pokemon to see a picture of it. This also supports shiny and costumes, to see exactly what an upcoming shiny will look like.")
                );

        new EmbedsMode()
        .setArray(embeds)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .showPageIndicator(true)
        .setPage(1)
        //.setFooter('Test Footer Text')
        .setColor(0xFF00AE)
        .setDeleteOnTimeout(true)
        .build();
    }
}

module.exports = DocsCommand;