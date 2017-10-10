var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const fs = require("fs");
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - (' + bot.id + ')');
});

// Declare the name of the json file
var json_filename = "./tracker/points.json";
// Open the json file as 'points'
let points = JSON.parse(fs.readFileSync(json_filename, "utf8"));

// Check if any eggs need to be hatched at an interval
var hatch_counter = setInterval(function () {
		update_hatch();
		}, 10000);
//``````````````````````````````````````````````````````````````````````````````````````````

bot.on('message', function (user, userID, channelID, message, evt) {
	// Our bot needs to know if it will execute a command
	// It will listen for messages that will start with `!`
	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args[0];
		args = args.splice(1);
		var i = 0;
		// var channels = bot.channel.find();
		
// Begin swtich		
		switch(cmd) {
// Simple ping to see if the bot is online
			case 'ping': // 'ping'
// Respond to ping
				message_to("`Pong!`", channelID);
			break; // End 'ping'
			
//Display channel ID
			case 'channel': // 'channel'
// Display the channelID
				message_to(channelID, channelID);
			break; // End 'channel'
			
// Set the default channel
			case 'default': // 'channel'
// TODO: Sets the default channel for this server
				message_to("`This feature has no functionality yet.`", channelID);
			break; // End 'channel'
			
// Help command
			case 'help': // 'help'
// Call a function to display help to the user
// TODO: Finish the help function
				help(channelID);
			break; // End 'help'
			
// How many eggs do I have
			case 'eggs': // 'eggs'
// Make sure the user exists
				check(user, userID);
// Send the number of rare and common eggs to the channel
				bot.sendMessage({to: channelID, message: 
							user + ` you have ${points[userID].eggs.rare} rare eggs\n` + 
							`and ${points[userID].eggs.common} common eggs.`});
			break; // End 'eggs'
			
// How many chickens do I have
// TODO: Format how many chickens should be displayed
// TODO: Sort the chickens by level/hp?
			case 'chickens': // 'chickens'
// Make sure the user exists
				check(user, userID);
				chicken_display(userID, channelID);
			break; // End 'chickens'
			
// Take all the eggs!
			case 'take': // 'take'
// Make sure there are eggs to take
				if (points["eggs"].rare == 0 && points["eggs"].common == 0)
					message_to("There are no eggs to take!", channelID);
// If there are eggs, give them to the user
				else
					addEggs(user, userID, channelID);
			break; // end 'take'
			
// Same as 'take'
			case 't': // 't'
// Make sure there are eggs to take
				if (points["eggs"].rare == 0 && points["eggs"].common == 0)
					message_to("There are no eggs to take!", channelID);
// If there are eggs, give them to the user
				else
					addEggs(user, userID, channelID);
			break; // End 't'
			
// Fight - player, mobs, boss
			case 'fight': // 'fight'
				check(user, userID);
				if (points[userID].lineup == -1)
					message_to("`You need a lineup to fight." + 
						"\nUse !lineup to begin`", channelID);
				else if (points[userID].fight_status != 0)
					message_to("`You are already in combat\n" + 
						"Use '!attack' to attack or '!heal' to heal.`", channelID);
				else 
					switch (args[0]){
						case 'player':
							message_to("`This feature is not implemented yet.`", channelID);
						break;
						case 'boss':
							message_to("`You are not high enough level to challenge a boss.`", channelID);
						break;
						case 'lowlands':
							fight_mob('low', userID, channelID);
							// message_to("`You are not high enough level to fight here.`", channelID);
						break;
						case 'midlands':
							fight_mob('mid', userID, channelID);
							// message_to("`You are not high enough level to fight here.`", channelID);
						break;
						case 'highlands':
							fight_mob('high', userID, channelID);
							// message_to("`You are not high enough level to fight here.`", channelID);
						break;
						default:
							message_to("`Fight options are: player, lowlands, midlands, highlands, boss.`", channelID);
						break;
					}
			break;
			
// Attack!
			case 'attack': // 'attack'
				check(user, userID);
// Not in combat
				if (points[userID].fight_status == 0)
					message_to("`The command you are looking for is '!fight'`", channelID);
// Mob fights
				else if (points[userID].fight_status == 1){ // high/mid/low lands
					attack(userID, channelID);
				}
// TODO: Complete boss fight
				else if (points[userID].fight_status == 2){ // boss
					message_to("`This feature is not yet complete`", channelID);
					points[userID].fight_status = 0;
				}
// TODO: Complete pvp battle
				else if (points[userID].fight_status == 3){ // pvp
					message_to("`This feature is not yet complete`", channelID);
					points[userID].fight_status = 0;
				}
			break;
			
// Heal!
			case 'heal': // 'heal'
				check(user, userID);
// Not in combat
				if (points[userID].fight_status == 0)
					message_to("`You are not currently in combat.`", channelID);
// Mob fights
				else if (points[userID].fight_status == 1){ // high/mid/low lands
					heal(userID, channelID);
				}
// TODO: Complete boss fight
				else if (points[userID].fight_status == 2){ // boss
					message_to("`This feature is not yet complete`", channelID);
					points[userID].fight_status = 0;
				}
// TODO: Complete pvp battle
				else if (points[userID].fight_status == 3){ // pvp
					message_to("`This feature is not yet complete`", channelID);
					points[userID].fight_status = 0;
				}
			break;
			
// Case to hatch an egg
			case 'open': // 'open'
// Ensure user exists
				check(user, userID);
// Trying to hatch a rare egg
				if (args[0] == 'rare')
					open_rare(userID, channelID);
// Trying to hatch a comon egg
				else if (args[0] == 'common')
					open_common(userID, channelID);
// Both
				else if (args[0] == 'both'){
					open_rare(userID, channelID);
					open_common(userID, channelID);
				}
// Same as both
				else if (args[0] == 'all'){
					open_rare(userID, channelID);
					open_common(userID, channelID);
				}
				else
// Display the usage for this command
					bot.sendMessage({to: channelID, message: "`Usage: open [rare/common/both]`"});
			break;// End 'open'
			
// Same as open
			case 'hatch': // 'hatch'
// Ensure user exists
				check(user, userID);
// Trying to hatch a rare egg
				if (args[0] == 'rare')
					open_rare(userID, channelID);
// Trying to hatch a common egg
				else if (args[0] == 'common')
					open_common(userID, channelID);
// Both
				else if (args[0] == 'both'){
					open_rare(userID, channelID);
					open_common(userID, channelID);
				}
// Same as both
				else if (args[0] == 'all'){
					open_rare(userID, channelID);
					open_common(userID, channelID);
				}
				else
// Display the usage for this command
					bot.sendMessage({to: channelID, message: "`Usage: open [rare/common/both]`"});
			break; // End 'hatch'
			
// Chicken fight team!
			case 'lineup': // 'lineup'
				check(user, userID);
				lineup(args, userID, channelID);
			break; // End 'lineup'
			
// Remove a chicken
			case 'remove': // 'remove'
				check(user, userID);
				if (args[0] == null)
					chicken_display(userID, channelID);
				else if (points[userID].fight_status != 0)
					message_to("`You cannot do that in combat!`", channelID);
				else
					remove_chicken(userID, args[0], channelID);
			break; // End 'remove'
			
// Stop typing '!test' !!
			case 'test': // 'test'
				message_to("Don't test me, " + user, channelID);
			break; // End 'test'
			
// Shop
// TODO: What do we want to do here?
			case 'buy': // 'buy'
				// what's for sale?
			break; // End 'buy'
			
			default:
				message_to("`Use !help for a list of commands.`", channelID);
			break;
			
		 }
	 }
});

// TODO: Max number of chickens/eggs
//	Option to remove chickens
//	Chicken combat
//	Balancing
//	PVP
//	Enable mid and highlands
//	Way of determining when mid/highlands unlock?
//		must have 3 level 2+ to unlock mid and 4 level 3+ for high
//	 Bosses similar
//		3 level 2s to unlock first boss, etc.


	// if (points[userID].fight_status == 1){
		// if (points[userID].chicken[points[userID].lineup].current_hp < 0){
			// Splice((points[userID].lineup), 1);
			// message_to("Your chicken died!", channel);
		// }
	// }
	// else {
		
			
		// points[userID].fight_status = 1;
		// }
	// }
// };

function remove_chicken(userID, chicken_num, channelID){
	var number_of_chickens = count_chickens(userID)
	if (number_of_chickens >= 1 && chicken_num < number_of_chickens){
		message_to("`" + chicken_num + ") level : " + points[userID].chickens[chicken_num - 1].level + 
				"   HP : " + points[userID].chickens[chicken_num - 1].current_hp +
				"/" + points[userID].chickens[chicken_num - 1].max_hp +
				"   Attack : " + points[userID].chickens[chicken_num - 1].atk +
				"   Heal : " + points[userID].chickens[chicken_num - 1].heal + '\n' + 
				"Has been removed!`", channelID);
		if  (points[userID].lineup == chicken_num - 1)
			points[userID].lineup = -1;
		points[userID].chickens.splice(chicken_num - 1, 1);
	}
	else 
		message_to("That chicken cannot be removed!", channelID);
	updateJSON();
};

function chicken_display(userID, channelID){
///////////////////////////////////////////	
// Count how many chickens a user has
// TODO: Easier way to do this?
	var x = count_chickens(userID);
	var message = "`";
// Append the chickens' stats to a message
	for (var y = 0; y < x; y++)
	message += "level : " + points[userID].chickens[y].level + 
		"   HP : " + points[userID].chickens[y].max_hp +
		"   Attack : " + points[userID].chickens[y].atk +
			"   Heal : " + points[userID].chickens[y].heal + '\n';
// Send the message
	if (x == 0)
		message += "You have no chickens!";
	message += "`";
	message_to(message, channelID);
}

function fight_player(){
	
};

function fight_mob(tier, userID, channelID){
	switch (tier){
		case 'low':
			var chicken = {
				"max_hp" : Math.round(Math.random() * (50 - 30)) + 30,
				"current_hp" : 0,
				"atk" : Math.round(Math.random() * (10 - 8)) + 8,
				"heal" : Math.round(Math.random() * (9 - 6)) + 6,
				"exp" : Math.round(Math.random() * (80 - 50)) + 50,
				"gold" : Math.round(Math.random() * (5 - 1)) + 1,
				"fighter" : userID
			};
			chicken.current_hp = chicken.max_hp;
			points["enemy_chickens"].push(chicken);
			points[userID].fight_status = 1;
		break;
		case 'mid':
			var chicken = {
				"max_hp" : Math.round(Math.random() * (80 - 60)) + 60,
				"current_hp" : 0,
				"atk" : Math.round(Math.random() * (15 - 12)) + 12,
				"heal" : Math.round(Math.random() * (15 - 10)) + 10,
				"exp" : Math.round(Math.random() * (120 - 85)) + 85,
				"gold" : Math.round(Math.random() * (10 - 6)) + 6,
				"fighter" : userID
			};
			chicken.current_hp = chicken.max_hp;
			points["enemy_chickens"].push(chicken);
			points[userID].fight_status = 1;
		break;
		case 'high':
			var chicken = {
				"max_hp" : Math.round(Math.random() * (150 - 100)) + 100,
				"current_hp" : 0,
				"atk" : Math.round(Math.random() * (25 - 15)) + 15,
				"heal" : Math.round(Math.random() * (30 - 15)) + 15,
				"exp" : Math.round(Math.random() * (250 - 150)) + 150,
				"gold" : Math.round(Math.random() * (35 - 20)) + 20,
				"fighter" : userID
			};
			chicken.current_hp = chicken.max_hp;
			points["enemy_chickens"].push(chicken);
			points[userID].fight_status = 1;
		break;
		default:
			message_to("`Oops, something went wrong!`");
		break;
	}
	updateJSON();
	message_to("`A wild chicken appears!`", channelID);
};
	
function fetch_chicken(userID){
	var x = count_enemy_chickens("enemy_chickens");
	for (var y = 0; y < x; y++)
		if (points["enemy_chickens"][y].fighter == userID){
			// console.log(points["enemy_chickens"]);
			return y;
		}
	// return -1;
};

function check_level_up(userID){
	if (points[userID].chickens[points[userID].lineup].exp >= 
			(1000 * points[userID].chickens[points[userID].lineup].level))
			level_up(userID);
};

function level_up(userID, channelID){
	var chicken = points[userID].chickens[points[userID].lineup];
	chicken.max_hp +=  Math.round(Math.random() * (((chicken.level + 1) * 8) - 10)) + 10;
	chicken.heal +=  Math.round(Math.random() * (((chicken.level + 1) * 6) - 6)) + 6;
	chicken.atk +=  Math.round(Math.random() * (((chicken.level + 1) * 6) - 6)) + 6;
	chicken.current_hp = chicken.max_hp;
	chicken.exp -= (1000 * chicken.level);
	chicken.level ++;
	message_to("`Your chicken leveled up!\n" + 
			"Use '!chickens' to view your chicken list`", channelID);
	updateJSON();
};

function chicken_combat(userID, channelID){
	var chicken_location = fetch_chicken(userID);
	var chicken = points["enemy_chickens"][chicken_location];
	if (chicken.current_hp < 20 || (chicken.current_hp / chicken.max_hp) < .3)
		chicken_mob_heal(chicken, channelID);
	else
		chicken_mob_attack(userID, chicken, channelID);
};

function chicken_mob_heal(chicken, channelID){
	var plus_minus = Math.random() >= 0.5;
	var heal_mod = Math.round(Math.random() * (chicken.gold + 2) - 2) + 2
	var total_heal = chicken.heal
	if (plus_minus)
		total_heal += heal_mod;
	else
		total_heal -= heal_mod;
	chicken.current_hp += total_heal;
	message_to("`Enemy chicken healed " + total_heal + " HP`", channelID);
	updateJSON();
};

function chicken_mob_attack(userID, chicken, channelID){
	var plus_minus = Math.random() >= 0.5;
	var atk_mod = Math.round(Math.random() * (chicken.gold + 2) - 2) + 2
	var total_atk = chicken.atk
	if (plus_minus)
		total_atk += atk_mod;
	else
		total_atk -= atk_mod;
	points[userID].chickens[points[userID].lineup].current_hp -= total_atk;
	if (points[userID].chickens[points[userID].lineup].current_hp <= 0){
		message_to("`Enemy chicken hit for " + total_atk + " damage.\n" + 
			"Your chicken died!`", channelID);
			points["enemy_chickens"].splice(fetch_chicken(userID), 1);
			points[userID].chickens.splice(points[userID].lineup, 1);
			points[userID].lineup = -1;
			points[userID].fight_status = 0;
	}
	else{
		// chicken.current_hp += total_atk;
		message_to("`Enemy chicken hit for " + total_atk + " damage.\n" + 
				"Your chicken is at " + points[userID].chickens[points[userID].lineup].current_hp + " HP`", channelID);
	}
	updateJSON();
};

function attack(userID, channelID){
	var chicken_location = fetch_chicken(userID);
	var chicken = points["enemy_chickens"][chicken_location];
	var plus_minus = Math.random() >= 0.5;
	var atk_mod = Math.round(Math.random() * (points[userID].chickens[points[userID].lineup].level + 2) - 1) + 1
	var total_atk = points[userID].chickens[points[userID].lineup].atk
	if (plus_minus)
		total_atk += atk_mod;
	else
		total_atk -= atk_mod;
	console.log(plus_minus);
	chicken.current_hp -= total_atk;
	if (chicken.current_hp <= 0){
		points[userID].gold += chicken.gold;
		points[userID].chickens[points[userID].lineup].exp += chicken.exp;
		check_level_up(userID, channelID);
		points[userID].fight_status = 0;
		message_to("`Enemy chicken took " + total_atk + " damage and was defeated!\n" + 
			"Your chicken gained " + chicken.exp + " experience.\n" + 
			"You gained " + chicken.gold + " gold.`", channelID);
		points["enemy_chickens"].splice(chicken_location, 1);
	}
	else{
		chicken_combat(userID, channelID);
		message_to("`Enemy chicken took " + total_atk + " damage!`", channelID);
	}
		updateJSON();	
};

function heal(userID, channelID){
	if (points[userID].chickens[points[userID].lineup].current_hp ==
		points[userID].chickens[points[userID].lineup].max_hp)
		message_to("`Cannot heal, chicken already at full health!`", channelID);
	else{
		var plus_minus = Math.random() >= 0.5;
		var heal_mod = Math.round(Math.random() * (points[userID].chickens[points[userID].lineup].level + 2) - 1) + 1
		var total_heal = points[userID].chickens[points[userID].lineup].heal
		if (plus_minus)
			total_heal += heal_mod;
		else
			total_heal -= heal_mod;
		points[userID].chickens[points[userID].lineup].current_hp += total_heal;
		message_to("`Chicken restored " + total_heal + " HP`", channelID);
		if (points[userID].chickens[points[userID].lineup].current_hp >
			points[userID].chickens[points[userID].lineup].max_hp){
			points[userID].chickens[points[userID].lineup].current_hp = points[userID].chickens[points[userID].lineup].max_hp;
			message_to("`Chicken health at max!`", channelID);
			}
		chicken_combat(userID, channelID);
	}
};

function fight_boss(){
	
};

function lineup(args, userID, channelID){
// Player chooses which chicken he/she will fight with
//
// Declare the number of chickens to iterate through
	var num_chickens = count_chickens(userID);
// Parse the argument
	var chicken_choice = parseFloat(args[0])
// If player has chosen a chicken
	if (chicken_choice <= num_chickens){
// Set the lineup chicken
		points[userID].lineup = chicken_choice - 1;
// Display the number and stats of the chosen chicken
		message_to("`" + chicken_choice + ") level : " + points[userID].chickens[chicken_choice - 1].level + 
							"   HP : " + points[userID].chickens[chicken_choice - 1].current_hp +
							"/" + points[userID].chickens[chicken_choice - 1].max_hp +
							"   Attack : " + points[userID].chickens[chicken_choice - 1].atk +
							"   Heal : " + points[userID].chickens[chicken_choice - 1].heal + '\n' + 
							"Has been chosen to FIGHT!`", channelID);
	}
// Ensure the player has chickens to fight with
	else if (num_chickens >= 1){
// Display chickens the player has
		var message = "`Please choose your chicken with '!lineup [#]'\n";
		for (var y = 0; y < num_chickens; y++)
			message += y + 1 + ") level : " + points[userID].chickens[y].level + 
							"   HP : " + points[userID].chickens[y].current_hp +
							" / " + points[userID].chickens[y].max_hp +
							"   Attack : " + points[userID].chickens[y].atk +
							"   Heal : " + points[userID].chickens[y].heal + '\n';
		message += "`";
		message_to(message, channelID)
	}
// No chickens to lineup
	else
		message_to("`You need to hatch more chickens first!\n" + 
			"Use !hatch for more information.`", channelID);
// Update this information in the json
	updateJSON();
};

function count_chickens(userID){
// Simple function to count the number of chickens a player has
//
// Increment x equal to the number of chickens in the array
	var x = 0;
	for (var chicken in points[userID].chickens)
		x++;
	console.log("num of chikens = " + x);
// Return the number of chickens
	return x;
	
}

function count_enemy_chickens(){
// Simple function to count the number of enemy chickens a player has
//
// Increment x equal to the number of chickens in the array
	var x = 0;
	for (var chicken in points["enemy_chickens"])
		x++;
// Return the number of chickens
	return x;
	
}

function update_hatch(){
// updates the time and checks if any eggs are ready to hatch
//
// Logs "Hatch check"
	console.log("Hatch check.");
// Set the new time
	// points["egg_time"] = {"common":0, "rare":0};
	points["time"] = new Date().getTime();
// Increments through users
	for (var userID in points){
// If the user is not "eggs" (used for storing number of eggs in play)
		if (userID != "eggs" && userID != "time" && userID != "egg_time" && userID != "enemy_chickens"){
// Print users for debugging
			// console.log(userID);
// Calls hatch function if an egg is ready to emerge
			if (points[userID].hatch.rare_end != 0 &&
				points[userID].hatch.rare_end  - points["time"] < 0)
				rare_egg_hatched(userID);
// Calls hatch function if an egg is ready to emerge
			if (points[userID].hatch.common_end != 0 &&
			points[userID].hatch.common_end - points["time"] < 0)
				common_egg_hatched(userID);
// Calls common_egg_spawner if it's time to spawn an egg
			if (points["time"] > points["egg_time"].common &&
			points["egg_time"].common - points["time"] < 0)
				common_egg_spawner();
// Calls rare_egg_spawner if it's time to spawn an egg
			if (points["time"] > points["egg_time"].rare &&
			points["egg_time"].rare - points["time"] < 0)
				rare_egg_spawner();

// Update this information in the json
			updateJSON()
		}
	}
};

function round(value, decimals) {
// Simple round function
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function rare_egg_hatched(userID){
// Once a chicken is ready to emerge!
// 
// Define where a notification message should be sent
// TODO: Notify when a chicken hatches?
	var channel = '365929907655802882'
// Declare a chicken
	var chicken = {};
	// var key = points[userID].chickens;
	// chicken[key] = [];
// Give the chicken some RARE stats
	var rare_chicken = {
		"max_hp" : Math.round(Math.random() * (100 - 50)) + 50,
		"current_hp" : 0,
		"atk" : Math.round(Math.random() * (25 - 15)) + 15,
		"heal" : Math.round(Math.random() * (25 - 15)) + 15,
		"exp" : 100,
		"level" : 1
	};
	rare_chicken["current_hp"] = rare_chicken["max_hp"];
	// chicken[key].push(rare_chicken);
	points[userID].chickens.push(rare_chicken);
// Reset that you are no longer hatching a rare egg
	points[userID].hatch.rare_end = 0;
// Display stats
	message_to(points[userID].username + "'s rare chicken hatched with stats: " + 
	"\nHP : " + rare_chicken.max_hp + 
	"\nAttack : " + rare_chicken.atk +
	"\nHeal : " + rare_chicken.heal, channel);
// Update this information in the json
	updateJSON();
};

function common_egg_hatched(userID){
// Once a chicken is ready to emerge!
//
// Define where a notification message should be sent
	var channel = '365929907655802882'
// Declare a chicken object
	var chicken = {};
	// var key = points[userID].chickens;
	// chicken[key] = [];
// Give the chicken some common stats
	var common_chicken = {
		"max_hp" : Math.round(Math.random() * (80 - 30)) + 30,
		"current_hp" : 0,
		"atk" : Math.round(Math.random() * (20 - 7)) + 7,
		"heal" : Math.round(Math.random() * (20 - 7)) + 7,
		"exp" : 0,
		"level" : 1
	};
	common_chicken["current_hp"] = common_chicken["max_hp"];
	// chicken[key].push(common_chicken);
	console.log(common_chicken);
	points[userID].chickens.push(common_chicken);
// Reset that you are no longer hatching a common egg
	points[userID].hatch.common_end = 0;
// Display stats
	message_to(points[userID].username + "'s common chicken hatched with stats: " + 
	"\nHP:" + common_chicken.max_hp + 
	"\nAttack:" + common_chicken.atk +
	"\nHeal:" + common_chicken.heal, channel);
// Update this information in the json
	updateJSON();
};

function open_rare(userID, channel){
// Called with 'hatch' or 'open' rare
//
// If player already has a rare egg hatching
	if (points[userID].hatch.rare_end != 0){
// Update the hatch time
		update_hatch();
// Display how much time it will take to the user
		var m = points[userID].hatch.rare_end - points["time"];
		m = m / 60000
// Round to 2 decimal places
		m = round(m, 2);
		m += ' minutes until hatch!'
		message_to("Rare: " + m, channel);
	}
// New egg to hatch
// Ensure the player has at least 1 rare egg
	else if (points[userID].eggs.rare >= 1){
// Define the time it takes to hatch a rare egg
// Currently 2 hours
		points[userID].hatch.rare_end = new Date().getTime() + (2 * 60 * 60 * 1000);
// Find the amount of time left
// Display the time until the egg is hatched
		var m = 120;
		m += ' minutes until hatch!';
// In case to debug
		// console.log(m);
		message_to(m, channel);
// Decrease the number of rare eggs the user has by 1
		points[userID].eggs.rare--;
	}
// Player has no rare eggs to hatch :(
	else
		message_to(`You do not have a rare egg to hatch!`, channel);
// Update this information in the json
	updateJSON();
};

function open_common(userID, channel){
// Called with 'hatch' or 'open' common
//
// If player already has a common egg hatching
	if (points[userID].hatch.common_end != 0){
// Update the hatch time
		update_hatch();
// Display how much time it will take to the user
		var m = points[userID].hatch.common_end - points["time"];
		m = m / 60000
// Round to 2 decimal places
		m = round(m, 2);
		m += ' minutes until hatch!'
		message_to("Common: " + m, channel);
	}
// New egg to hatch
// Ensure the player has at least 1 common egg
	else if (points[userID].eggs.common >= 1){
// Define the time it takes to hatch a common egg
// Currently 2 hours
		points[userID].hatch.common_end = new Date().getTime() + (15 * 60 * 1000);
// Find the amount of time left
// Display the time until the egg is hatched
		var m = 15;
		m += ' minutes until hatch!';
// In case to debug
		// console.log(m);
		message_to(m, channel);
// Decrease the number of common eggs the user has by 1
		points[userID].eggs.common--;
	}
// Player has no common eggs to hatch :(
	else
		message_to(`You do not have a common egg to hatch!`, channel);
// Update this information in the json
	updateJSON();
};

function common_egg_spawner(){
// Spawn a rare egg into play
//
// Increment number of rare eggs
	points["eggs"].common++;
// Reset the common egg timer with a random value
	var amount_of_time = Math.round(Math.random() * (10 - 4)) + 2;
	amount_of_time *= 60 * 1000;
	points["egg_time"].common = points["time"] + amount_of_time;
// Update file (store the eggs if the bot crashes)
	updateJSON();
// Define where a notification message should be sent
	var channel = '365929907655802882'
// Send a message to notify users there is an egg
	console.log("Common egg spawned!");
// Tell the console when the egg spawns
	message_to("Common egg spawned!", channel);
// Tell the console how many rare eggs are in play
	console.log(points["eggs"].common + " eggs.");
};

function rare_egg_spawner(){ 
// Spawn a rare egg into play
//
// Increment number of rare eggs
	points["eggs"].rare++;
// Reset the common egg timer with a random value
	var amount_of_time = Math.round(Math.random() * (40 - 30)) + 20;
	amount_of_time *= 60 * 1000;
	points["egg_time"].rare = points["time"] + amount_of_time;
// Update file (store the eggs if the bot crashes)
	updateJSON();
// Define where a notification message should be sent
	var channel = '365929907655802882'
// Send a message to notify users there is an egg
	message_to("Rare egg spawned!", channel);
// Tell the console when the egg spawns
	console.log("Rare egg spawned!");
// Tell the console how many rare eggs are in play
	console.log(points["eggs"].rare + " rare eggs.");
};

function check(user, userID){
// Check to make sure the user exists
//
// If not create one
	if (!points[userID])
// Define array of chickens, num of common and rare eggs
// Store the timing of when rare and common eggs will hatch
		points[userID] = {"username" : user,
		"lineup" : -1,
		"hp" : 1000, // current HP
		"fight_status" : 0, // not fighting
		"level" : 1, // current level
		"gold" : 0, // current gold
		"chickens":[], // chickens and chicken stats - define chicken objects and push
		"eggs":{"common" : 1, "rare" : 1}, // number of eggs, common and rare
		"hatch" : {"rare_end" : 0, "common_end" : 0} // used as an 'end timer' for hatching rare and common eggs
		}
// Update this information in the json
	updateJSON();
};

function addEggs(user, userID, channelID){
// Give eggs to the user who calls 'take' or 't'
//
// Makes sure the user exists (other function)
	check(user, userID);
// Increments the amount of common and rare eggs the user has
	points[userID].eggs.common += points["eggs"].common;
	points[userID].eggs.rare += points["eggs"].rare;
// Define the message - notify how many of each egg has been obtained
	var m = user;
// Variable to determine how the common eggs should print depending on if
//  There are rare eggs or not
	var claimed = 0;
	if (points["eggs"].rare == 1){
		m += ` claimed a rare egg`;
		claimed = 1;
	}
	else if (points["eggs"].rare > 1){
		m += ` claimed ${points["eggs"].rare} rare eggs`;
		claimed = 1;
	}
	else{
		claimed = 0;
	}
	if (claimed == 1 && points["eggs"].common != 0){
		if (points["eggs"].common == 1)
			m += ` and a common egg!`;
		else if (points["eggs"].common > 1)
			m += ` and ${points["eggs"].common} common eggs!`;
	}
	else{
		if (points["eggs"].common == 1)
			m += ` claimed a common egg.`;
		else if (points["eggs"].common > 1)
			m += ` claimed ${points["eggs"].common} common eggs!`;
	}
// Send the final message to the channel
	bot.sendMessage({to: channelID, message: m});
// Reset the number of rare and common eggs back to 0
// TODO: Could change this if players have a cap on the number of eggs they can hold
	points["eggs"].common = 0;
	points["eggs"].rare = 0;
// Update this information in the json
	updateJSON();
};

function message_to(m, channelID){
// Simple way of not using bot.sendMessage in every function
//
	bot.sendMessage({to: channelID, message: m});
};

function help(channelID){
// This is the help function
// 
// TODO: Complete help function
// Must determine the full scope of the game first
	var help = '`!help					This message.\n';
	help += '!ping						Pong!\n';
	help += '!channel					Display the current channel ID.\n';
	help += '!take						Take the eggs!.\n';
	help += '!eggs						Shows how many eggs you have.\n';
	help += '!chickens 					Display your chickens.\n';
	help += '!remove [#]				Remove the chicken #.\n';
	help += '!fight [area]				Start a fight with the chosen option.\n';
	help += '!attack					You choose to attack (in combat).\n';
	help += '!heal						You choose to heal (in combat).\n';
	help += '!lineup [#]				Choose the chicken that you want to fight with.\n';
	help += '!hatch [rare/common/both]	Begin hatching or display how much time is left for your egg(s) to hatch.\n`';
	
// Send the message to the channel help was called form
	message_to(help, channelID);
};

function updateJSON() {
// Save to json file
//
// Save to JSON
	fs.writeFile(json_filename, JSON.stringify(points), 
		(err) => {
			if (err) console.error(err);
		}
	);
};
