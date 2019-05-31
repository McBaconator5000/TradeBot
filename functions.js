const pokeList = require('./pokelist.json');
const costumes = require('./costume.json');
const util = require('util');
const urlExists = util.promisify(require('url-exists'));
const stringSimilarity = require('string-similarity');
const Jimp = require('jimp');
const arceus = require('./arceusforms.json')

String.prototype.insert = function (index, string) {
    if (index > 0)
      return this.substring(0, index) + string + this.substring(index, this.length);
  
    return string + this;
};

//functions
function pad(num, size){
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function fourNumbers(str){
    if(str.length <= 4){
        return false
    }else{
        for(var i = 0; i < 4; i++){
            if(isNaN(parseInt(str.charAt(i), 10))){
                return false
            }
        }
        return true //only true if first four chars are numbers
    }
}




module.exports = {
    getImage: async function(args){
        var pokeArr = args.split(" "); 
        var pokeName = pokeArr[pokeArr.length - 1];//pokemon name is last word
        //manual spell check
        if (pokeName.toLowerCase() == "onyx"){
            pokeName = "onix"
        }else if (pokeName.toLowerCase() == "nidoran-f"){
            pokeName = "nidoranf"
        }else if (pokeName.toLowerCase() == "nidoran-m"){
            pokeName = "nidoranm"
        }
        //spell check pokemon name here
        var guessPoke = stringSimilarity.findBestMatch(pokeName, Object.keys(pokeList)).bestMatch.target;
        var pokeNum = pad(pokeList[guessPoke], 3);
        var shinyStr = args.includes("shiny") ? "_shiny" : "";
        var typeNum = 0;
        //typeNum definitions
        if(args.includes("female")){
            typeNum++;
        }
        if(args.includes("alola")){
            typeNum = 61;
        }

        /////////form stuff//////
        if(pokeNum == "421" && args.includes("sunny")){
            //cherrim 421
            typeNum = 12
        }
        if(pokeNum == "351"){
            //castform 351
            if(args.includes("sun")){
                typeNum = 12
            }else if(args.includes("rain")){
                typeNum = 13
            }else if(args.includes("snow")){
                typeNum = 14
            }
        }
        if(pokeNum == "386"){
            //deoxys 386
            if(args.includes("attack")){
                typeNum = 12
            }else if(args.includes("defense")){
                typeNum = 13
            }else if(args.includes("speed")){
                typeNum = 14
            }
        }
        if((pokeNum == "421" || pokeNum == "422") && args.includes("east")){
            //shellos / gastrodon 422/423
            typeNum = 12
        }
        if(pokeNum == "412" || pokeNum == "413"){
            //burmy/ wormadam 412 /413
            if(args.includes("plant")){
                typeNum = 11
            }else if(args.includes("sand")){
                typeNum = 12
            }else if(args.includes("trash")){
                typeNum = 13
            }
        }
        if(pokeNum == "487" && args.includes("origin")){
            //giratina 487
            typeNum = 12
        }
        if(pokeNum == "479"){
            //rotom 479
            if(args.includes("heat")){
                typeNum = 12
            }else if(args.includes("wash")){
                typeNum = 13
            }else if(args.includes("frost")){
                typeNum = 14
            }else if(args.includes("fan")){
                typeNum = 15
            }else if(args.includes("mow")){
                typeNum = 16
            }
        }
        if(pokeNum == "492" && args.includes("sky")){
            //shamin 492
            typeNum = 12
        }
        if(pokeNum == "493"){
            //arceus 493
            for (var poketype in arceus){
                if(args.includes(poketype)){
                    typeNum = arceus[poketype]
                }
            }
        }
        if(pokeNum == "327"){
            //spinda 327
            var spindaNumber = parseInt(pokeArr[pokeArr.length - 2]) //if no form given returns NaN
            typeNum = spindaNumber + 10 //NaN + 10 is 10, which is default... :D
        }



        //converts nubmer to 2 digit string
        typeNumStr = pad(typeNum,2)
        //first build of url
        //url example https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_001_00.png
        var url =    "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_"+pokeNum+"_"+typeNumStr+shinyStr+".png"

        //if female or alolan don't exist. set to neutral/kanto
        let isExists = await urlExists(url); //first check, if cannot find pokemon go to default
        if(isExists){
            url = url
        }else{
            url = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_"+pokeNum+"_"+"00"+shinyStr+".png" //default pokemon icon
        }

        if(pokeNum == "201"){
            //checking for unowns 
            var letterStr = "00";
            var unownLetterRaw = pokeArr[pokeArr.length - 2] //unown letter will be before word "unown"
            //if word before not 1 letter, use first letter
            var unownLetter = unownLetterRaw.substring(0,1).toLowerCase()
            if(unownLetter == "!"){
                letterStr = "37"
            }else if(unownLetter == "?"){
                letterStr = "38"
            }else{
                letterStr = (unownLetter.charCodeAt(0) - 86) + "";
            }
            url =    "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_"+pokeNum+"_"+letterStr+shinyStr+".png"

            let isExists = await urlExists(url); //first check, if cannot find pokemon go to default
            if(isExists){
                url = url
            }else{
                url = "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_"+pokeNum+"_"+"00"+shinyStr+".png" //default pokemon icon
            }
        }
        
        


        //adding costumes 
        var costume = "";
        for(var num in costumes){//go through all costume numbers in json
            var costObj = costumes[num];//set name/ishat to object
            for(var i = 0; i < costObj.names.length; i++){//go through all in array of names
                if(args.includes(costObj.names[i])){
                    costume = num;
                }
            }
        }


        //second build of url - insert costume data 
        costurl = url.insert(95,costume)
        isExists = await urlExists(costurl); //second check, if cannot find pokemon go to what it was
        if(isExists){
            url = costurl
        }else{
            url = url
        }



        isExists = await urlExists(url); //final check, if cannot find pokemon go to default
        if(isExists){
            return url
        }else{
            return "https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_000.png" //fake pokemon icon
        }


    },
    makeImage: async function(pokeArray, imgName){
        if(pokeArray.length >= 4){//if array too long...ignore all but first 3 entries
            pokeArray = pokeArray.slice(0,3)
        }
        let pokePic = await module.exports.getImage(pokeArray[pokeArray.length - 1])
        if(pokeArray.length == 1){
            return pokePic
        }
        for(var h = pokeArray.length - 1; h > 0; h--){
            if(pokeArray[h-1] != undefined){
                //console.log("looking for: "+ pokeArray[h-1])
                let pokePicAddition = await module.exports.getImage(pokeArray[h - 1])
                await Jimp.read(pokePic)
                    .then(async function(img1){
                        await Jimp.read(pokePicAddition)
                        .then(async function (img2){
                            //console.log("adding: "+ pokeArray[h-1])
                            pokePic = await img1.composite(img2, 50*[h], 0, Jimp.BLEND_DESTINATION_OVER).writeAsync(imgName)
                            .then(tpl => {return tpl})
                        })
                    }).catch(err => {
                        console.log(err)
                    })
            }
        }
        return imgName
    },
    respond: async function(message, foundUser, friendCode){
        var confirmStr = "I found a trainer matching that name."

        message.channel.send(confirmStr)
            .then(async message => {
                try{
                    var memberObj = await message.guild.fetchMember(foundUser)
                    await message.edit(confirmStr + " Their discord name is " + memberObj + ".")
                    if(friendCode != 0){
                        message.edit(message.content + "\nI'll now print their friend code in a separate message for easy copy/pasting.")
                        message.channel.send(friendCode)
                    }
                }catch{
                    message.edit(confirmStr + " They're not on this server but you may be able to find them on discord using this tag " + foundUser.tag)
                }
            })
    },
    findCode: function(textResult){
        var lineArray = textResult.split('\n') //split text up by line
        for(var i = 0; i < lineArray.length; i++){//got through each line of text
            var lineText = lineArray[i]
            //console.log(lineText + " : " + fourNumbers(lineText))
            if(fourNumbers(lineText)){ //look at every line longer than 11 characters and lines with first char is number
                var noSpaces = lineText.replace(/\s/g, "")//removes spaces
                var trimmed = noSpaces.substring(0,12) //trim to 12 numbers
                if(parseInt(trimmed, 10) != NaN){//double check that it is a number
                    //re-add spaces for easy reading
                    var readable = trimmed.insert(8, " ")
                    readable = readable.insert(4, " ")
                    return readable
                }
            }
        }
    }, 
    findIGN: function(textResult){
        var lineArray = textResult.split('\n') //split text up by line
        for(var i = 0; i < lineArray.length; i++){//got through each line of text
            var lineText = lineArray[i]
            if(lineArray[i+1] != undefined){//check if there is a next line
                var nextLine = lineArray[i+1]
                if(nextLine.includes("YOUR TRAINER CODE") || nextLine.includes("TU CODIGO DE ENTRENADOR")){//look for static text the line before will be the trainer name
                    //remove anything that is not a number or letter.
                    var trainerName = lineText.replace(/[^A-Za-z0-9]/g, "")
                    return trainerName
                }
            }
        }
    }

}

