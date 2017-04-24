// I installed the request packages, and they access the request module
// Setting initial variables and places to read info from
var request = require("request");
var inquirer = require("inquirer");
var Twitter = require("Twitter");
var fs = require("fs");
var twitterStuff = require("./keys.js");
var userBet = "";
var cardArray = [];
var card = 0;
var dealersCount = 0;
var bankTotal = 0;

// These next 2 are for the old school way of asking for info
var command = process.argv[2];
var searchParameter = process.argv[3];
var userSelects = "";

inquirer.prompt([

  	{	type: "list",
    	message: "Select TWEETS to see my last 20 tweets, select SPOTIFY (and it will ask you for the name) to see info about a song, select MOVIE (and it will ask you for the name) to see info on that movie, select DO WHAT IT SAYS to run a command for you.",
    	choices: ["_____NADA_____", "TWEETS", "SPOTIFY A SONG", "GET MOVIE INFO", "DO WHAT IT SAYS", "*** PLAY BLACKJACK ***"],
    	name: "choices"
  	}
	
  ]).then(function(user) {
    
	command = user.choices;

	// This will prompt the user for the name if they select spotify a song or get movie info
	if (command === "SPOTIFY A SONG" || command === "GET MOVIE INFO") { 
	   		inquirer.prompt([
			{	type: "input",
	  			name: "name",
	   			message: "Please enter the name"
	 		}
	 	]).then(function(user) {
			searchParameter = user.name;
			whatToDo();
		});
	} else { whatToDo(); }
});

function whatToDo () {
	if (command === "my-tweets" || command === "TWEETS") { twitter();
	} else if (command === "spotify-this-song" || command === "SPOTIFY A SONG") { spotify();
	} else if (command === "movie-this" || command === "GET MOVIE INFO") { movie();
	} else if (command === "do-what-it-says" || command === "DO WHAT IT SAYS") { doWhatItSays();
	} else if (command === "*** PLAY BLACKJACK ***") { checkBankAccount();
	}
}

// This runs when the user types node liri.js my-tweets
// It will log the last 20 tweets and when they were created
function twitter() {

	// This gets all the keys and secrets from the keys.js file
	// (along with the var twitterStuff = require("./keys.js"); from above)
	var client = new Twitter(twitterStuff.twitterKeys);
	var params = {screen_name: 'RudyGesegnet'};

	// This makes a call to Twitter for the username RudyGesegnet
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  	if (!error) {

	  		// This checks to make sure there are at least 20 tweets.
	  		// I'll try to tweet 20 times by Thursday, but this is in case I don't.
	  		if (tweets.length >= 20) { totalTweets = 20
	  		} else {totalTweets = tweets.length}

	  		// This runs a loop of the last 20 tweets and shows them in the terminal
		  	for (var i = 0; i < totalTweets; i++) {
			  	var userName = tweets[i].user.name;
			  	var userTweet = tweets[i].text;
				var userDate = tweets[i].created_at;
			  	console.log("Tweet #" + (i + 1) + ": " + userName + " tweeted at " + userDate + ": " + userTweet);
		 		console.log("=========================================================");
		 	}
	  	}
	});
}

// This runs when the user types node liri.js spotify-this-song "..."
function spotify() {
	request("https://api.spotify.com/v1/search?query=" + searchParameter + "&type=track&offset=0&limit=1", function(error, response, body) {
		if (!error && response.statusCode === 200) {
	  		var songResults = JSON.parse(body);
	  		
	  		// This checks to see if there are any results for this search
	  		var total = songResults.tracks.total;

	  		if (total === 0) {
	  			console.log("Sorry, there were no results for your search, but please enjoy...");
		  		console.log("Artist: Ace of Base");
		  		console.log("Track Name: The Sign");
		  		console.log("Track preview: https://p.scdn.co/mp3-preview/4c463359f67dd3546db7294d236dd0ae991882ff?cid=null");
		  		console.log("From the Album: The Sign");
	  		} else if (total != 0) {
	  			var artistName = songResults.tracks.items[0].album.artists[0].name;
	  			var trackName = songResults.tracks.items[0].name;
	  			var trackPreview = songResults.tracks.items[0].preview_url;
	  			var album = songResults.tracks.items[0].album.name;

		  		console.log("Artist: " + artistName);
		  		console.log("Track Name: " + trackName);
		  		console.log("Track preview: " + trackPreview);
		  		console.log("From the Album: " + album);
		  	}
	  	}
	});
}

// This runs when the user types node liri.js movie-this "..."
function movie() {
	request("http://www.omdbapi.com/?t=" + searchParameter, function(error, response, body) {
		if (!error && response.statusCode === 200) {
	  		var movieResults = JSON.parse(body);

	  		// This checks to see if there are any results for this search
	  		var movieResponse = movieResults.Response;

	  		if (movieResponse === "False") {
	  			console.log("Sorry, there were no results for your search, but...");
	  			console.log("If you haven't watched Mr. Nobody, then you should: http://www.imdb.com/title/tt0485947/");
				console.log("It's on Netflix!");
	  		} else if (movieResponse === "True") {
		  		var movieTitle = movieResults.Title;
		  		var movieYear = movieResults.Year;
		  		var movieRating = movieResults.imdbRating;
		  		var movieCountry = movieResults.Country;
		  		var movieLanguage = movieResults.Language;
		  		var moviePlot = movieResults.Plot;
		  		var movieActors = movieResults.Actors;

		  		// This checks to make sure there is a Rotten Tomato rating for this movie
		  		if (movieResults.Ratings[1] !== undefined) { var movieRottenRating = movieResults.Ratings[1].Value;
		  		} else { var movieRottenRating = "There is no Rotten Tomatoes rating for this movie";
		  		}

		  		console.log("Move Title: " + movieTitle);
		  		console.log("Year Move came out: " + movieYear);
		  		console.log("IMDB Rating: " + movieRating);
		  		console.log("Country made in: " + movieCountry);
		  		console.log("Language of the movie: " + movieLanguage);
		  		console.log("Short plot: " + moviePlot);
		  		console.log("Actors in the movie: " + movieActors);
		  		console.log("Rotten Tomatoes rating: " + movieRottenRating);
	  		}
	  	}
	});	
}

// This runs when the user types node liri.js do-what-it-says
function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function(error, data) {
		var splitUp = data.split(",");
		command = splitUp[0];
		searchParameter = splitUp[1];
		whatToDo();
	});
}


// This runs if the user selects to play BLACKJACK
function checkBankAccount() {
	// This reads from the bankaccount.txt file to see how much money the user has
	fs.readFile("bankaccount.txt", "utf8", function(error, data) {
		bankTotal = parseFloat(data);

		// If the user has less than $0, this asks them to add more money
		if (bankTotal < 1) { console.log("You have $" + bankTotal + " in your account.");
			console.log("To add more money, type STUART IS THE MAN, STUART IS AN AWESOME CODER");

			// This prompts the user to enter anything
			inquirer.prompt([{	type: "input",
    							message: "Have something you would like to tell me?",
    							name: "whatUserTyped"
    		}

	  		]).then(function(user) {
	  			// This checks to see what the user typed, if they typed the correct phrase, money is added to their account
		  		if (user.whatUserTyped === "S") {
		  			bankTotal = bankTotal + 50;
		  			console.log("CONGRATS, you have added $50 to your account");
		  			console.log("You now have $" + bankTotal + " in your account.");
		  			fs.writeFile("bankaccount.txt", bankTotal, function(err) {});
		  			betAmount();
		  		} else { console.log("No money for you! You cannot play.");
		  		return;
		  		}
			});
		} else { betAmount(); }
	});
}

function betAmount() {
	// This reads to see how much the user has in their account
	fs.readFile("bankaccount.txt", "utf8", function(error, data) {
		// Converts it to a number
		bankTotal = parseFloat(data);
		console.log("===================================================================");
		console.log("Welcome to BLACKJACK. In this game, you cannot split, double-down, or take insurance");
		console.log("All aces are 1 only.  The dealer will stand on 17, and hit on anything below that.")
		console.log("Cards that are 11, 12, 13 (Jack, Queen, King) all have a value of 10, and will be shown as 10 only");
		console.log("***** You have a total of $" + bankTotal + " in your account. *****");
		console.log("================================");
	
		// This prompts the user to select from a list of possible bets
		inquirer.prompt([{	type: "list",
	    					message: "How much would you like to bet?",
	    					choices: ["2", "5", "10", "20", "50"],
	    					name: "choices"
	  	}

	  	]).then(function(user) { userBet = +user.choices; 
			playBlackjack();
		});
	});
}

// This shopws the first 2 cards and the dealer card from the cardArray
function playBlackjack() {
	console.log("You have bet $" + userBet + ". GOOD LUCK!");
	generateCards();
	cardTotal = cardArray[1] + cardArray[2];
	console.log("================================");
	console.log("The dealer's shown card is a " + cardArray[0]);
	console.log("You have been dealt a " + cardArray[1] + " and a " + cardArray[2]);
	console.log("Your total is " + cardTotal);
	i = 3;
	nextCard();
}

// This runs to select 40 random numbers into an array.
function generateCards() {
	// This will generate a list of random cards.
	// Cards that are 11, 12, 13 (Jack, Queen, King) all have a value of 10.
	for (var i = 0; i < 40; i++) {
		card = Math.floor(Math.random() * 13) + 1;
		if (card > 10) { card = 10; }
		cardArray.push(card);
	}
}

// This runs everytime the user takes another card and for the first card
function nextCard() {
	inquirer.prompt([{	type: "list",
    					message: "Do you HIT (take another card), or STAND (receive no more cards)",
    					choices: ["HIT","STAND"],
    					name: "hitorstand"
  	}

  	]).then(function(user) { 

  		// This checks to see what the user selected
	  	if (user.hitorstand === "STAND") { dealersCount = cardArray[0] + cardArray[i];
	  		console.log("================================");
	  		console.log("You stand on " + cardTotal);
	  		console.log("The dealers shown card is a " + cardArray[0]);
	  		console.log("The dealers hole card is a " + cardArray[i]);
	  		console.log("The dealer's total is " + dealersCount);
	  		dealersTurn();
	  		return;

	  	} else if (user.hitorstand === "HIT") { cardTotal = cardTotal + cardArray[i];
	  	console.log("================================");
	  	console.log("***** You were just dealt a: " + cardArray[i] + ". Your new total is: " + cardTotal + " *****");
		}

		if (cardTotal > 21) { console.log("================================");
			console.log("The dealers up card is a " + cardArray[0]);
	  		console.log("The dealers hole card is a " + cardArray[i]);
	  		console.log("The dealer's total is " + (cardArray[0] + cardArray[i]));
	  		dealersCount = cardArray[0] + cardArray[i];
	  		compareHands();
	  		return;
		} else if (cardTotal == 21) { console.log("================================");
			console.log("The dealers up card is a " + cardArray[0]);
	  		console.log("The dealers hole card is a " + cardArray[i]);
	  		console.log("The dealer's total is " + (cardArray[0] + cardArray[i]));
	  		dealersCount = cardArray[0] + cardArray[i];
	  		compareHands();
			return;
		} else if (cardTotal < 22) {
			console.log("The dealer's shown card is a " + cardArray[0]);
			i++;
			nextCard();
		}
	});
}

// This only runs after the user selects STAND or the user has gone over 21.
function dealersTurn() {
	// This checks to see the total the dealer has
	if (dealersCount >= 17) { compareHands();
		return;
	} 
	dealersCount = dealersCount + cardArray[i];
	console.log("================================");
	console.log("The delaer's next card is a " + cardArray[i]);
	console.log("The dealer has a total of " + dealersCount);
	i++;
	dealersTurn();
	return;
}

function compareHands() {
	console.log("================================");
	console.log("The dealer has a total of " + dealersCount);
	console.log("You have a total of " + cardTotal);
	console.log("================================");

	if (dealersCount > 21) { console.log("The dealer BUSTS, YOU WIN!");
		console.log("You WON $" + userBet + "!");
		bankTotal = bankTotal + userBet;
	} else if (cardTotal > 21) { console.log("You have bust, and you LOSE!");
		console.log("You lost $" + userBet + ".");
		bankTotal = bankTotal - userBet;
	} else if (dealersCount === cardTotal) { console.log("It's a TIE!");
	} else if (dealersCount > cardTotal) { console.log("The dealer has defeated you");
		console.log("You lost $" + userBet + ".");
		bankTotal = bankTotal - userBet;
	} else if (dealersCount < cardTotal) { console.log("You have defeated the dealer!");
		console.log("You WON $" + userBet + "!");
		bankTotal = bankTotal + userBet;
	}
	console.log("You now have a total of $" + bankTotal + " in your account");
	// This writes to the file the new amount the user has in their bank account
	fs.writeFile("bankaccount.txt", bankTotal, function(err) {});
}