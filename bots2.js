var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const fs = require("fs");
// Configure logger settings
//bot.channels[channelID].guild_id ------- THIS WORKS
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
			
// Name your chicken! ...why
			case 'name': // 'name'
// Make sure there are eggs to take
				check(user, userID);
				name(userID, args[0], args[1], channelID);
			break;
			
// Fight - player, mobs, boss
			case 'fight': // 'fight'
				check(user, userID);
				if (points[userID].lineup == -1)
					message_to("`You need a lineup to fight." + 
						"\nUse !lineup to begin`", channelID);
				else if (points[userID].player_enemy_id != '' && (args[0] != 'accept' && args[0] != 'decline'))
					message_to("`You cannot enter combat while you have a pending pvp invite.\n" + 
						"Use '!fight accept' to accept or '!fight decline' to decline.`", channelID);
				else if (points[userID].fight_status == 0 || points[userID].fight_status == 3 || points[userID].fight_status == 4)
					message_to("`You are already in combat\n" + 
						"Use '!attack' to attack or '!heal' to heal.`", channelID);
				else 
					switch (args[0]){
						case 'accept':
							message_to("`This feature is not implemented yet.`", channelID);
							// fight_player('accept', userID, channelID);
						break;
						case 'decline':
							message_to("`This feature is not implemented yet.`", channelID);
							// fight_player('decline', userID, channelID);
						break;
						case 'player':
							message_to("`This feature is not implemented yet.`", channelID);
							// fight_player(args[1], userID, channelID);
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
							message_to("`Fight options are: lowlands, midlands, highlands.`", channelID);
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
// Not your turn in PVP
				else if (points[userID].fight_status == 3){ // pvp
					message_to("`It is not your turn!`", channelID);
					points[userID].fight_status = 0;
				}
// Your turn in PVP
				else if (points[userID].fight_status == 4){ // pvp
					attack(userID, channelID);
				}
			break;
			
// Heal!
			case 'heal': // 'heal'
				check(user, userID);
				heal(userID, channelID);
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
			
// Display player's gold
			case 'gold': // 'gold'
				check(user, userID);
				message_to("`You have " + points[userID].gold + " gold.`", channelID);
			break; // End 'gold'
			
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


// FIGHT STATUS
// 1 = mob
// 2 = boss
// 3 = NOT my turn
// 4 = My turn
// 5 = pending pvp
function find_player_ID(user){
	for (userID in points){
		if (userID != "eggs" && userID != "time" && userID != "egg_time" && userID != "enemy_chickens")
			// console.log(points[userID].username);
			if (points[userID].username == user){
				return userID;
			}
	}
};

function name(userID, chicken_num, chicken_name, channelID){
// Ability to name your chickens
//
// Ensure the player has chickens
	if (count_chickens(userID) == 0)
		message_to("`yOU hAs nO cHicKEnS!`", channelID);
// If the user did not enter a number (call to isInteger) and string (I suppose this can be anything)
	else if (!isInteger(chicken_num) || chicken_name == undefined)
		message_to("`Usage: !name [#] [name]`", channelID);
// If the user chose a number higher than the number of chickens they have
// Recall that the chicken display numbers starting at 1
	else if (chicken_num > count_chickens(userID))
		message_to("`You don't have that many chickens!`", channelID);
// User tries to enter a number less than 1 (chicken[-1] doesn't exist!)
	else if (chicken_num < 1)
		message_to("`eRrOR tHaT'S noT rIGhT!1!`", channelID);
// Change the name of the chicken
	else{
		// message_to("a" + chicken_num + "b" + chicken_name + "c", channelID);
		points[userID].chickens[chicken_num - 1].name = chicken_name;
		message_to("`" + chicken_name + " has been named!`", channelID);
	}
// Update this information in the json
	updateJSON();
};

function isInteger(x){
// Simple function to determine if a passed variable is an integer
    return x % 1 === 0;
};

function remove_chicken(userID, chicken_num, channelID){
// Gives players the option to remove a chicken
//
// Declare a variable for the number of chickens a user has
	var number_of_chickens = count_chickens(userID)
// Ensure the user has chickens and that the number they select is within the chicken count
	if (number_of_chickens >= 1 && chicken_num <= number_of_chickens){
// Way of determining if the name should be printed
// Based on if name variable is blank
		if (points[userID].chickens[chicken_num - 1].name != "")
			message_to("`" + points[userID].chickens[chicken_num - 1].name + ", level : " + points[userID].chickens[chicken_num - 1].level + 
					"   HP : " + points[userID].chickens[chicken_num - 1].current_hp +
					"/" + points[userID].chickens[chicken_num - 1].max_hp +
					"   Attack : " + points[userID].chickens[chicken_num - 1].atk +
					"   Heal : " + points[userID].chickens[chicken_num - 1].heal + 
					" has been removed!`", channelID);
// Otherwise just print out the chicken's stats
		else
			message_to("`" + chicken_num + ") level : " + points[userID].chickens[chicken_num - 1].level + 
				"   HP : " + points[userID].chickens[chicken_num - 1].current_hp +
				"/" + points[userID].chickens[chicken_num - 1].max_hp +
				"   Attack : " + points[userID].chickens[chicken_num - 1].atk +
				"   Heal : " + points[userID].chickens[chicken_num - 1].heal + '\n' + 
				"Has been removed!`", channelID);
// If the chicken was their lineup chicken, reset their lineup to -1
		if  (points[userID].lineup == chicken_num - 1)
			points[userID].lineup = -1;
// Remove the chicken from the player's array
		points[userID].chickens.splice(chicken_num - 1, 1);
	}
// Something else went wrong
	else 
		message_to("That chicken cannot be removed!", channelID);
// Update this information in the json
	updateJSON();
};

function chicken_display(userID, channelID){
// Display the chickens a user has
//
// Count how many chickens a user has
// TODO: Easier way to do this?
	var x = count_chickens(userID);
	if (x > 30){
		message_to("`An additional " + (x - 30) + " chickens are not being shown.`", channelID);
		x = 30;
	}
// Begin the message
	var message = "`";
// Append the chickens' stats to a message
	for (var y = 0; y < x; y++)
		if (points[userID].chickens[y].name != "")
			message += y + 1 + ") " + points[userID].chickens[y].name + 
				", level : " + points[userID].chickens[y].level + 
				"   HP : " + points[userID].chickens[y].max_hp +
				"   Attack : " + points[userID].chickens[y].atk +
				"   Heal : " + points[userID].chickens[y].heal + '\n';
		else
			message += y + 1 + ") level : " + points[userID].chickens[y].level + 
				"   HP : " + points[userID].chickens[y].max_hp +
				"   Attack : " + points[userID].chickens[y].atk +
				"   Heal : " + points[userID].chickens[y].heal + '\n';
// If the player has no chickens
	if (x == 0)
		message += "You have no chickens!";
// Terminate the message
	message += "`";
// Send the message
	message_to(message, channelID);
};

function fight_player(player_accept_decline, userID, channelID){
// Function to control how a player accepts/declines or invites players to pvp
// TODO: Finish function
// TODO: Option to bet money?!
// Switch statement for option passed (accept/decline/player)
	switch (player_accept_decline){
// Case Accept
		case 'accept':
// Ensure pending request
			if (points[userID].player_enemy_id == '')
				message_to("`You have no pending pvp invites!`", channelID);
// Accept the invite
			else{
// Set a variable equal to the userID of the pvp initializer
				var challenger = points[userID].player_enemy_id;
// Update fight status
// Accepter gets to go first (4)
// Challenger goes second (3)
				points[userID].fight_status = 4;
				points[challenger].fight_status = 3;
// Send a message
// TODO: Notify both players upon accepting
				message_to("`You have accepted " + points[challenger].username + "'s pvp invite!`", channelID);
			}
		break;
// Case Decline
		case 'decline':
// Ensure pending request
			if (points[userID].player_enemy_id == '')
				message_to("`You have no pending pvp invites!`", channelID);
			else{
// Set a variable equal to the userID of the pvp initializer
				var challenger = points[userID].player_enemy_id;
// Update status to 0 (not in combat) for both
				points[userID].fight_status = 0;
				points[challenger].fight_status = 0;
				points[challenger].player_enemy_id = userID;
// Send a message
// TODO: Notify both players upon declining
				message_to("`You have declined " + points[challenger].username + "'s pvp invite!`", channelID);
			}
		break;
// Declare new PVP request
		default:
// Locate player name called in database
			var challenger = find_player_ID(player_accept_decline);
// If the player name could not be found
			if (challenger == undefined)
				message_to("`Could not find player " + player_accept_decline + "!`", channelID);
// If the opponent has no lineup set
// TODO: Option to change mid-fight exists so maybe change this?
			// else if (challenger.lineup == -1)
				// message_to("`Your opponent must have a chicken in their lineup!`", channelID);
// Successful
			else if (points[challenger].fight_status == 0){
				// Change opponent's fight status to pending invite
				points[challenger].fight_status = 5;
// Change opponent's player_enemy_id to caller's ID				
				points[challenger].player_enemy_id = userID;
// Change own fight status to pending
				points[userID].fight_status = 5;
// Send confirmation
// TODO: Notify the other player
				message_to("`Invite sent successfully!`", channelID);
			}
// If the opponent is already fighting or pending
			else
				message_to("`Your opponent is already engaged in battle!`", channelID);
			// console.log(challenger.fight_status);
		break;
	}
};

function fight_mob(tier, userID, channelID){
// Creates a chicken to fight!
//
// Switch statement for the teir of chicken
	switch (tier){
// Low tier
		case 'low':
// Create a chicken object
			var chicken = {
				"max_hp" : Math.round(Math.random() * (50 - 30)) + 30, // Total max hp
				"current_hp" : 0, // The current HP the chicken has
				"atk" : Math.round(Math.random() * (10 - 8)) + 8, // Base attack power
				"heal" : Math.round(Math.random() * (9 - 6)) + 6, // Base heal power
				"exp" : Math.round(Math.random() * (80 - 50)) + 50, // Amount of experience granted upon death
				"gold" : Math.round(Math.random() * (5 - 1)) + 1, // Amount of gold granted upon death
				"fighter" : userID // The userID of who the chicken is fighting (Each chicken only has 1 opponent)
			};
// Set the current hp equal to the max
			chicken.current_hp = chicken.max_hp;
// Add the chicken to the enemy chicken array
			points["enemy_chickens"].push(chicken);
// Change the fight status of the player to engaged in a mob fight
			points[userID].fight_status = 1;
		break; // End low tier
		
// Mid tier
// Same as low but different random numbers
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
		break; // End mid tier
		
// High tier
// Same as mid and low tier but different random numbers
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
		break; // End high tier
		
// Something went wrong
		default:
			message_to("`Oops, something went wrong!`");
		break;
	}
// Update this information in the JSON
	updateJSON();
// A wild chicken! message
	message_to("`A wild chicken appears!`", channelID);
};
	
function fetch_chicken(userID){
// Find which chicken the player is fighting
// Should only be called when there is 100% chance the user is fighting a chicken
//
// Count how many enemy chickens exist
	var x = count_enemy_chickens("enemy_chickens");
// Loop through the enemy chickens looking for the fighter to match the userID
	for (var y = 0; y < x; y++)
		if (points["enemy_chickens"][y].fighter == userID)
// Return the index of the "enemy_chickens" array where the chicken exists			
			return y;
};

function check_level_up(userID, channelID){
// Determine if the chicken can level up
//
// If the chicken's experience is at 1000 * the level
	if (points[userID].chickens[points[userID].lineup].exp >= 
			(1000 * points[userID].chickens[points[userID].lineup].level))
// Call the level up function
			level_up(userID, channelID);
};

function level_up(userID, channelID){
// Function for leveling up a user's chicken
//
// Declare a chicken variable equal to the user's lineup chicken
// This should be the only chicken eligible to level up because it was engaged in combat when this function was called
	var chicken = points[userID].chickens[points[userID].lineup];
// Increase stats of HP, Heal, and attack
	chicken.max_hp +=  Math.round(Math.random() * (((chicken.level + 1) * 8) - 10)) + 10;
	chicken.heal +=  Math.round(Math.random() * (((chicken.level + 1) * 6) - 6)) + 6;
	chicken.atk +=  Math.round(Math.random() * (((chicken.level + 1) * 6) - 6)) + 6;
// Reset the current hp equal to the max HP
	chicken.current_hp = chicken.max_hp;
// Reset the chicken's Experience to 0
	chicken.exp -= (1000 * chicken.level);
// Increase the chicken's level
	chicken.level ++;
// Send a message confirming the chicken leveled up
	message_to("`Your chicken leveled up!\n" + 
			"Use '!chickens' to view your chicken list`", channelID);
// Update this information in the JSON
	updateJSON();
};

function chicken_combat(userID, channelID){
// How mob enemy chicken engages in combat
//
// TODO: Balancing
// Fetch the chicken the user is fighting
	var chicken_location = fetch_chicken(userID);
	var chicken = points["enemy_chickens"][chicken_location];
// Very simplified function for determining attack or heal on behalf of the enemy chicken
	if (chicken.current_hp < 20 || (chicken.current_hp / chicken.max_hp) < .3)
		chicken_mob_heal(chicken, channelID);
	else
		chicken_mob_attack(userID, chicken, channelID);
};

function chicken_mob_heal(chicken, channelID){
// Function for the enemy mob chicken to heal
//
// Declares random plus or minus to add to the base heal ability of the chicken
	var plus_minus = Math.random() >= 0.5;
// The random numbers are based on the gold drop instead of chicken level or tier (as in player attacks/heals)
	var heal_mod = Math.round(Math.random() * (chicken.gold + 2) - 2) + 2
	var total_heal = chicken.heal
	if (plus_minus)
		total_heal += heal_mod;
	else
		total_heal -= heal_mod;
// Heal the chicken
	chicken.current_hp += total_heal;
// Message that the enemy chicken healed
	message_to("`Enemy chicken healed " + total_heal + " HP`", channelID);
// Update this information in the JSON
	updateJSON();
};

function chicken_mob_attack(userID, chicken, channelID){
// Function for the enemy mob chicken to attack
//
// Declares the amount of damage the chicken will do
// Same formula as the chicken mob heal function
	var plus_minus = Math.random() >= 0.5;
	var atk_mod = Math.round(Math.random() * (chicken.gold + 2) - 2) + 2
	var total_atk = chicken.atk
	if (plus_minus)
		total_atk += atk_mod;
	else
		total_atk -= atk_mod;
// Subtracts the damage from the user's chicken hp
	points[userID].chickens[points[userID].lineup].current_hp -= total_atk;
// Checks if the user's chicken is dead
	if (points[userID].chickens[points[userID].lineup].current_hp <= 0){
// Simple functionality to determine if the chicken had a name - It's nice to be remembered when you die :(
		if (points[userID].chickens[points[userID].lineup].name != "")
			message_to("`Enemy chicken hit for " + total_atk + " damage.\n" + 
				"Your chicken, " + 
					points[userID].chickens[points[userID].lineup].name +
					" has died!`", channelID);
// The chicken didn't have a name - What's in a name
		else 
			message_to("`Enemy chicken hit for " + total_atk + " damage.\n" + 
				"Your chicken died!`", channelID);
// Removes the enemy chicken from the enemy chickens array
		points["enemy_chickens"].splice(fetch_chicken(userID), 1);
// Removes the player's chicken from the player's chicken array
		points[userID].chickens.splice(points[userID].lineup, 1);
// Resets the player's lineup
		points[userID].lineup = -1;
// Resets the player's fight status
		points[userID].fight_status = 0;
	}
// The chicken didn't die
	else{
// Display how much HP the user's chicken has left as well as how much the enemy chicken hit for
		message_to("`Enemy chicken hit for " + total_atk + " damage.\n" + 
				"Your chicken is at " + points[userID].chickens[points[userID].lineup].current_hp + " HP`", channelID);
	}
// Update this information in the JSON
	updateJSON();
};

function attack(userID, channelID){
// Player chose to attack!
//
// TODO: Combine this to make it shorter
	if (points[userID].fight_status == 1){ // Mob fight
// Find the location of the chicken the player is fighting
		var chicken_location = fetch_chicken(userID);
		var chicken = points["enemy_chickens"][chicken_location];
// Declare a random 1 or 0 for attack modifier
		var plus_minus = Math.random() >= 0.5;
// Create an attack modifier
		var atk_mod = Math.round(Math.random() * (points[userID].chickens[points[userID].lineup].level + 2) - 1) + 1
// Declare total_atk to be the current attack of player's chicken
		var total_atk = points[userID].chickens[points[userID].lineup].atk
// Randomize (plus_minus) the attack modifier possitive or negative
		if (plus_minus)
			total_atk += atk_mod;
		else
			total_atk -= atk_mod;
// Deduct the health from the enemy chicken
		chicken.current_hp -= total_atk;
// If the chicken dies
		if (chicken.current_hp <= 0){
// Give the player gold
			points[userID].gold += chicken.gold;
// Give the chicken experience
			points[userID].chickens[points[userID].lineup].exp += chicken.exp;
// Check if the chicken should level up
			check_level_up(userID, channelID);
// Clear the fight status of the player
			points[userID].fight_status = 0;
// Send a message saying the player won
			message_to("`Enemy chicken took " + total_atk + " damage and was defeated!\n" + 
				"Your chicken gained " + chicken.exp + " experience.\n" + 
				"You gained " + chicken.gold + " gold.`", channelID);
			points["enemy_chickens"].splice(chicken_location, 1);
		}
// If the chicken didn't die
		else{
// Call how much damage was dealt
			message_to("`Enemy chicken took " + total_atk + " damage!`", channelID);
// Begin the enemy chicken's combat
			chicken_combat(userID, channelID);
		}
	} // End Mob fight
	
// If the player is involved in a PVP fight
	else if (points[userID].fight_status == 4){ // PVP
// Find the opponent's ID and chicken
		var enemy_player = points[userID].player_enemy_id;
		var enemy_chicken = points[enemy_player].chickens[points[enemy_player].lineup];
// Declare the same attack as with Mob fights
		var plus_minus = Math.random() >= 0.5;
		var atk_mod = Math.round(Math.random() * (points[userID].chickens[points[userID].lineup].level + 2) - 1) + 1
		var total_atk = points[userID].chickens[points[userID].lineup].atk
		if (plus_minus)
			total_atk += atk_mod;
		else
			total_atk -= atk_mod;
		enemy_chicken.current_hp -= total_atk;
// If the chicken's HP drops to 0 or less
		if (enemy_chicken.current_hp <= 0){
// Do not give gold
// TODO: Place bets as gold reward for pvp matches
			// points[userID].gold += chicken.gold;
// Give the chicken experince
			points[userID].chickens[points[userID].lineup].exp += chicken.exp;
// Check if the chicken leveled up
			check_level_up(userID, channelID);
// Clear the fight status of both players back to 0
			points[userID].fight_status = 0;
			points[enemy_player].fight_status = 0;
// Reset the player_enemy_id
			points[userID].player_enemy_id = '';
			points[enemy_player].player_enemy_id = '';
// Send a message
			message_to("`Enemy chicken took " + total_atk + " damage and was defeated!\n" + 
				"Your chicken gained " + chicken.exp + " experience.\n", channelID);
// Remove the chicken from the enemy chicken list
// TODO: Should the chicken die?
			points[enemy_player].splice(enemy_chicken, 1);
		}
// If the chicken didn't die
		else{
// Set the player's fight status to 3 (NOT YOUR TURN)
			points[userID].fight_status = 3;
// Sets the opponent's fight status to 4 (Your turn)
// TODO: Notify opponent
			points[enemy_player] = 4;
// Call how much damage was dealt
			message_to("`Enemy chicken took " + total_atk + " damage!`", channelID);

		}
	} // End PVP
	else
		message_to("`Hmm, something's not right.`", channelID);
// Update this information in the JSON
	updateJSON();	
};

function heal(userID, channelID){
// Function to heal all chickens (out of combat) or the chicken in the user's lineup (in combat)
//
// TODO: Finish comments for this function
// Not in combat - heal all chickens
	if (points[userID].fight_status == 0){ // Out of combat
		var num_chickens = count_chickens(userID);
		for (var x = 0; x < num_chickens; x++)
			points[userID].chickens[x].current_hp = points[userID].chickens[x].max_hp;
		message_to("`Your chickens have been healed`", channelID);
	}
	else if (points[userID].fight_status == 1){ // Mob fight
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
	} // End Mob Fight Heal
	
	else if (points[userID].fight_status == 4){ // PVP Fight
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
// Change player fight status to match whose turn it is
			points[userID].fight_status = 3;
			points[points[userID].player_enemy_id].fight_status = 4;
		}
	} // End PVP Heal
	else if (points[userID].fight_status == 3) // PVP Fight
		message_to("`It's not your turn!`", channelID);
	
	updateJSON();
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
		"name" : "",
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
		"name" : "",
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
		"hatch" : {"rare_end" : 0, "common_end" : 0}, // used as an 'end timer' for hatching rare and common eggs
		"player_enemy_id" : "" // log if there are pending/current pvp battles associated with this player
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
	var m = "`" + user;
// Variable to determine how the common eggs should print depending on if
//  There are rare eggs or not
	var claimed = 0;
	if (points["eggs"].rare == 1){
		m += " claimed a rare egg";
		claimed = 1;
	}
	else if (points["eggs"].rare > 1){
		m += " claimed " + points["eggs"].rare + " rare eggs";
		claimed = 1;
	}
	else{
		claimed = 0;
	}
	if (claimed == 1 && points["eggs"].common != 0){
		if (points["eggs"].common == 1)
			m += " and a common egg!";
		else if (points["eggs"].common > 1)
			m += " and " + points["eggs"].common + " common eggs!";
	}
	else{
		if (points["eggs"].common == 1)
			m += " claimed a common egg.";
		else if (points["eggs"].common > 1)
			m += " claimed " + points["eggs"].common + " common eggs!";
	}
	m += "`";
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
	help += '!heal						Heal all your chickens (outside combat).\n';
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
