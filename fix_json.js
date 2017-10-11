const fs = require("fs");
// Declare the name of the json file
var json_filename = "./tracker/points.json";
// Open the json file as 'points'
let points = JSON.parse(fs.readFileSync(json_filename, "utf8"));

for (userID in points)
	if (userID != "eggs" && userID != "time" && userID != "egg_time" && userID != "enemy_chickens"){
		points[userID].player_enemy_id = "";
		for(var x = 0; x < points[userID].chickens.length; x++){
			points[userID].chickens[x].name = "";
			console.log(userID + " chicken " + x + " fixed.");
		}
		console.log(userID + " Updated");
			
	}
	
updateJSON();
	
	
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
