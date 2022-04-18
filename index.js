const puppeteer = require('puppeteer');
const fs = require('fs');
const Discord = require('discord.js');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { channel } = require('diagnostics_channel');

channelID = "957210026798383106";

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
client.commands = new Discord.Collection();

const getLatest = async () => {
    //On démarre le navigateur, on charge la page et on accepte les cookies
    const URL = 'https://www.vinted.fr/vetements?size_id[]=207&size_id[]=208&size_id[]=209&size_id[]=206&catalog[]=5&brand_id[]=53&brand_id[]=88&brand_id[]=94&brand_id[]=304&brand_id[]=3573&brand_id[]=73952&brand_id[]=2319&brand_id[]=362&brand_id[]=585393&brand_id[]=14969&brand_id[]=139960&currency=EUR&order=newest_first&price_to=150';
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await page.click('#onetrust-accept-btn-handler');
    await page.waitForTimeout(5000);

    //On récupère tous les liens

    const getLinks = await page.evaluate(() => {
        let links = [];
        let elements = document.querySelectorAll('div.feed-grid__item-content');

        for (element of elements) {
            links.push(element.querySelector('a.ItemBox_overlay__1kNfX').href);
        }
        return links;
    });

    console.log(getLinks);

    //On suit tous les liens et on récupère les infos
    for(var i = 0; i< getLinks.length; i++){
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        await page.goto(getLinks[i], { waitUntil: 'load' });
        await page.waitForTimeout(5000);

        const latest = await page.evaluate(() => {
            let latest = [];
            let elements = document.querySelectorAll('div.content-container');
            let details = document.querySelectorAll('div.box.box--item-details');
            for (element of elements) {
                latest.push(element.querySelector('a.item-thumbnail.is-loaded').href);
            }
            for (detail of details){
                latest.push(detail.querySelector('h1.Text_text__QBn4-.Text_heading__gV4um.Text_left__3s3CR').textContent.trim());
                latest.push(detail.querySelector('a.inverse').textContent.trim());
                latest.push(detail.querySelectorAll('div.details-list__item-value')[1].textContent.trim());
                latest.push(detail.querySelectorAll('div.details-list__item-value')[2].textContent.trim());
                latest.push(detail.querySelector('h2.Text_text__QBn4-.Text_title__2EQGT.Text_left__3s3CR').textContent.trim());

            }
            return latest;
        });
        console.log(latest)
        const embed = new Discord.MessageEmbed()
        .setTitle(latest[5].toString())
        .setURL(page.url())
        .setAuthor('Vinted Bot')
        .setColor(0x00AE86)
        .addField('__***Etat :***__', latest[4].toString() + '\n▬\n__***Marque :***__\n' + latest[2].toString(), /* inline */ true)
        .addField('__***Prix :***__', latest[1].toString() + '\n▬\n__***Taille :***__\n' + latest[3].toString(), /* inline */ true)
        //.addField('__***Marque :***__', latest[2].toString(), /* inline */ true)
        //.addField('__***Taille :***__', latest[3].toString(), /* inline */ true)
        //.setDescription(latest[4].toString())
        //.setFooter("taille : " + latest[3].toString())
        .setImage(latest[0].toString())
        .setTimestamp();

        client.channels.cache.get('957210026798383106').send({ embeds: [embed] });
        await page.close();
        
      }
    await browser.close();
  };

  client.on('ready', () => {
    console.log('ready');
    //setInterval(getLatest, 300000);
    getLatest();
});




client.login('your token');







  // recup le prix depuis la page de recherche 
  // document.querySelectorAll('div.feed-grid__item-content h3 ')[0].textContent.trim()
  //recup tous les liens
  //document.querySelectorAll('a.ItemBox_overlay__1kNfX')[0].href