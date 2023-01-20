import vintedSearch from "./search.js";
import Discord from "discord.js";
import { QuickDB } from 'quick.db';
import config from "./config.json" assert { type: "json" };
import channels from "./channels.json" assert { type: "json" };

const db = new QuickDB();
const client = new Discord.Client( { intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  if (!db.get("vinted")) {
    db.set("vinted", {});
  }


  setInterval(async () => {

    console.log('Searching for new articles...')

    channels.forEach(async (channel) => {
      console.log(channel.channelId)
      const channelToSend = client.channels.cache.get(channel.channelId);

      let articles = await vintedSearch(channel.params) ?? { items: [] };
      if (!articles.items) return;
      let currentArticles = await db.get("vinted");
      let newArticles = articles.items?.filter((i) => !currentArticles[i?.id]);

      console.log(newArticles?.length + ' new articles found.')
      for (let i = 0; i < 5; i++) {
        let item = articles?.items[i];
        if (!currentArticles[item.id]) {
          currentArticles[item.id] = item;
          channelToSend.send({
            embeds: [
              {
                title: item.title,
                url: item.url,
                fields: [
                  {
                    name: "**``💶`` Prix**",
                    value: `\`\`\`YAML\n${item.price} €\`\`\`` ?? "Aucun",
                    inline: true,
                  },
                  {
                    name: "**``📏`` Taille**",
                    value: `\`\`\`YAML\n${item.size_title}\`\`\`` ?? "Aucune",
                    inline: true,
                  },
                  {
                    name: "**``🔖`` Marque**",
                    value: `\`\`\`YAML\n${item.brand_title}\`\`\`` ?? "Aucune",
                    inline: true,
                  },
                  {
                    name: "**``👨`` Auteur**",
                    value: `\`\`\`YAML\n${item.user.login}\`\`\`` ?? "Aucune",
                    inline: true,
                  },
                ],
                image: { url: item.photo?.url },
                timestamp: new Date(
                  item.photo.high_resolution.timestamp * 1000
                ),
                color: "#09b1ba",
              },
            ],
            components: [
              new Discord.MessageActionRow().addComponents([
                new Discord.MessageButton()
                  .setLabel("Détails")
                  .setURL(item.url)
                  .setEmoji("🗄️")
                  .setStyle("LINK"),
                new Discord.MessageButton()
                  .setLabel("Acheter")
                  .setURL(
                    `https://www.vinted.fr/transaction/buy/new?source_screen=item&transaction%5Bitem_id%5D=${item.id}`
                  )
                  .setEmoji("🪐")
                  .setStyle("LINK"),
              ]),
            ],
          })
        }
      }

      await db.set("vinted", currentArticles);
    });
  }, 15000);

});


client.login(config.token);
