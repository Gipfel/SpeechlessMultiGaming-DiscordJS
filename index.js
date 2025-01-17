const Discord = require("discord.js");
const client = new Discord.Client();
const config = {
  prefix: "#",
  token: process.env.TOKEN || "ODM0MTkxNTgxMjg0MTM5MDIw.YH9Tcw.-FcNGe3wqV2nH0RYOx1UL7oDKCk",
};

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: '45.131.108.156',
  user: 'DC-Bot',
  password: '0wna9uT1ompE@fWl',
  database: 'webpannel'
});
connection.connect();

client.on("ready", () => {
  console.log("------------------------");
  console.log("---- SmG BOT ONLINE ----");
  console.log("------------------------");
  client.user.setPresence({
    status: 'online',
    activity: {
        name: '#WeMakeUSpeechless',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/viostreamt/'
    }
})
  setInterval(() => {
    connection.query('SELECT * FROM accounts', function (err, rows, fields) {
      if (err)
        console.log('Connection result error ' + err);
      else {
        let i = 0;
        while (i < rows.length) {
          let dcid = rows[i].dcid;
          if (dcid) {
            let dbUser = message.guild.members.cache.get(dcid);
            let perms = rows[i].perms;
            switch (perms) {
              case "R6Main_Leader":
                perms = "Rainbow6 Main Leader";
                break;

              case "R6Main_Player":
                perms = "Rainbow6 Main";
                break;

              case "R6Main_Coach":
                perms = "Rainbow6 Main Coach";
                break;

              case "Streamer":
                perms = "Twitch Streamer";
                break;

              case "guest":
                perms = null;
                break;

              default:
                perms = null;
                break;
            }
            if (perms) {
              var role = message.guild.roles.cache.find(r => r.name === perms);
              dbUser.roles.add(role.id);
            } else {
              const roleLoopArray = ["Rainbow6 Main Leader", "Rainbow6 Main", "Rainbow6 Main Coach", "Twitch Streamer"];
              let i = 0;
              while (i < roleLoopArray.length) {
                if (message.member.roles.cache.some(role => role.name === roleLoopArray[i])) {
                  var removalRole = message.guild.roles.cache.find(r => r.name === roleLoopArray[i]);
                  dbUser.roles.remove(removalRole.id);
                }
                i++;
              }
            }
          }
          i++;
        }
      }

    });
  }, 3600000);
});

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const editedMessage = "Eine deiner Aufgaben wurde bearbeitet !";

client.on("messageUpdate", message => {
  if (message.guild.id === "714862777130549310" && message.channel.id === "776586730203512853") {
    const {
      member,
      mentions
    } = message;

    const target = mentions.roles.first();
    const giiipfel = "287527912721219584";
    const gipfelRole = "775471626904010793"
    const luki = "295907115372118016";
    const lukiRole = "775470853588648007";
    if (target) {
      if (target.id === gipfelRole)
        client.users.cache.get(giiipfel).send(editedMessage);
      if (target.id === lukiRole)
        client.users.cache.get(luki).send(editedMessage);
    }
  }
})

const addedMessage = "Dir wurde auf dem SmG Discord (im chief-chat) eine Aufgabe zugeteilt !";

client.on("message", message => {
  if (message.author.bot) return;

  // SmG Server
  if (message.guild.id === "714862777130549310" && message.channel.id === "776586730203512853") {
    const {
      member,
      mentions
    } = message;

    const target = mentions.roles.first();
    const giiipfel = "287527912721219584";
    const gipfelRole = "775471626904010793"
    const luki = "295907115372118016";
    const lukiRole = "775470853588648007";
    if (target) {
      if (target.id === gipfelRole)
        client.users.cache.get(giiipfel).send(addedMessage);
      if (target.id === lukiRole)
        client.users.cache.get(luki).send(addedMessage);
    }
  }

  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift();

  if (command == "link" || command == "verify") {
    let clientSecret = message.content.split(" ").slice(1);
    if (clientSecret != "") {
      // Checken ob Client Secret == eines aus der Datenbank
      connection.query(`SELECT * FROM accounts WHERE specialdc = '${clientSecret}'`, function (err, rows, fields) {
        if (err)
          console.log('Connection result error ' + err);
        else {
          if (rows.length > 0) {
            let userId = message.author.id;
            // Added DiscordId zum User, wo Secret == Secret => connection.query(''); "SELECT * from users WHERE name= ‘alan’ "
            connection.query(`UPDATE accounts SET dcid = '${userId}' WHERE specialdc = '${clientSecret}'`, function (err, rows, fields) {
              if (err)
                console.log('Connection result error ' + err);
              else {
                message.channel.send(`Congratulations <@${userId}>, you are now verified. Thank you !`);
                connection.query(`UPDATE accounts SET specialdc = '${generateString(15)}' WHERE dcid = '${userId}'`, function (err, rows, fields) {
                  if (err)
                    console.log('2 | Connection result error ' + err);
                })
              }
            });
          } else message.channel.send("That Client Secret isn't valid !");
        }

      });
    } else message.channel.send(`Wrong usage! Please use #link <Client Secret> !`);
  }

  if (command == "unlink") {
    const {
      member,
      mentions
    } = message;
    const target = mentions.users.first();
    if (target) {
      const targetMember = target.id;
      if (member.hasPermission("ADMINISTRATOR")) {
        connection.query(`SELECT * FROM accounts WHERE dcid = ${targetMember}`, function (err, rows, fields) {
          if (err)
            console.log('1 | Connection result error ' + err);
          else {
            if (rows.length != 0) {
              connection.query(`UPDATE accounts SET dcid = null WHERE dcid = ${targetMember}`, function (err, rows, fields) {
                if (err)
                  console.log('2 | Connection result error ' + err);
                else message.channel.send(`Successfully unlinked <@${targetMember}> !`);
              })
            } else message.channel.send("That user isn't linked to our system !");
          }
        });
      } else message.channel.send("You don't have any permissions to unlink someone !");
    } else {
      const targetMember = message.author.id;
      connection.query(`SELECT * FROM accounts WHERE dcid = ${targetMember}`, function (err, rows, fields) {
        if (err)
          console.log('1 | Connection result error ' + err);
        else {
          if (rows.length != 0) {
            connection.query(`UPDATE accounts SET dcid = null WHERE dcid = ${targetMember}`, function (err, rows, fields) {
              if (err)
                console.log('2 | Connection result error ' + err);
              else message.channel.send(`Successfully unlinked <@${targetMember}> !`);
            })
          } else message.channel.send("You aren't linked to our system !");
        }
      });
    }
  }
});

connection.query('SELECT * FROM accounts', function (err, rows, fields) {
  if (err)
    console.log('Connection result error ' + err);
  else
    console.log("Database synced, up and running !");
});

client.login(config.token);