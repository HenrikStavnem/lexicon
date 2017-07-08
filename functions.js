var connection = 'db.php';

function init(call) {
	//setContent("<h1>Initializing...</h1>");
	//populateWordlistCantade();
	
	switch(call) {
		case "lex_ec"	: populateWordlistEnglish(); break;
		case "lex_ce"	: populateWordlistCantade(); break;
		case "newword": initNewWord(); break;
	}
}

function initNewWord() {
	//TODO
	console.info("TODO initNewWord");
	
	// Input listeners
	$( ".input-listen" ).on( 'input', function() {
		notify() ;
	});
}

function notify() {
	console.log("hello");
}

function populateWordlistEnglish() {
	setContent("<h1>Fetching data...</h1>");
	$.post( connection, {
		call: "getWordlistEnglishSorted"
	} )
    .done(
		function( data ) {
			
			//console.log(data);
			
			var numbers = ["0", "1", "2", "3", "4" ,"5", "6", "7", "8" , "9"];
			
			var html = "";
			var currentLetter = "";
			var previousLexeme = "";
			var lexemeCount = 1;
			var wordcount = 0;
			
			setContent("<h1>Processing...</h1>");
			
			var entries = JSON.parse(data);
			for (var i in entries) {
				var entry = entries[i];
				
				wordcount++;
				
				var entryInitalLetter = getInitialLetterChangedIfChanged(entry.definition, currentLetter);
				var isNumber = jQuery.inArray(entryInitalLetter, numbers) !== -1;
				
				var definitions = "";
				// get definitions
				//console.log("sizes: " + entry.lexeme.length);
				
				for (var j in entry.lexeme) {
					if (definitions != "") {
						definitions = definitions + ", " + entry.lexeme[j];
					}
					else {
						definitions = definitions + entry.lexeme[j];
					}
				}				
				
				// get usages
				var usageString = "";
				
				var usageNumber = 0;
				for (var g in entry.usages) {
					if (entry.usages[g] != "") {
						usageNumber++;
						if (usageString != "") {
							usageString = usageString + "<br /><b>" + usageNumber + ":</b> "  + entry.usages[g];
						}
						else {
							usageString = usageString + "<b>" + usageNumber + ":</b> "  + entry.usages[g];
						}
						//usageString = usageString + entry.usages[g] + "<br />";
					}
				}
				
				if( !isNumber ) {
					//console.log("Is not a number");
					if (entryInitalLetter != "") {
						html = html + createHeadline(entryInitalLetter);
					}
					if (entryInitalLetter != "") {
						currentLetter = entryInitalLetter;
					}
				}
				else {
					if (currentLetter != "#") {
						currentLetter = "#";
						html = html + createHeadline("#");
					}
				}
				
				if (previousLexeme == entry.definition) {
					lexemeCount++;
				}
				else {
					lexemeCount = 1;
				}
				
				html = html + createEntry(false, definitions, lexemeCount, entry.lexClass, entry.definition, entry.irregular, entry.ipa, usageString);
				previousLexeme = entry.definition;
				//console.log(previousLexeme);
			}
			
			// Show lexicon
			setContent(html);
			setWordcount(wordcount);
		}
	);
}

function populateWordlistCantade() {
	setContent("<h1>Fetching data...</h1>");
	$.post( connection, {
		call: "getWordlistCantadeSorted"
	} )
    .done(
		function( data ) {
			
			//console.log(data);
			
			var numbers = ["0", "1", "2", "3", "4" ,"5", "6", "7", "8" , "9"];
			
			var html = "";
			var currentLetter = "";
			var wordcount = 0;
			var lexemeCount = 0;
			
			setContent("<h1>Processing...</h1>");
			
			var entries = JSON.parse(data);
			for (var i in entries) {
				var entry = entries[i];
				
				wordcount++;
				
				var entryInitalLetter = getInitialLetterChangedIfChanged(entry.definition, currentLetter);
				var isNumber = jQuery.inArray(entryInitalLetter, numbers) !== -1;
				
				var definitions = "";
				// get definitions
				console.log("sizes: " + entry.lexeme.length);
				
				for (var j in entry.lexeme) {
					if (definitions != "") {
						definitions = definitions + ", " + entry.lexeme[j];
					}
					else {
						definitions = definitions + entry.lexeme[j];
					}
				}
				var usageString = "";
				
				// get usages
				
				var usageNumber = 0;
				for (var g in entry.usages) {
					if (entry.usages[g] != "") {
						usageNumber++;
						if (usageString != "") {
							usageString = usageString + "<br /><b>" + usageNumber + ":</b> "  + entry.usages[g];
						}
						else {
							usageString = usageString + "<b>" + usageNumber + ":</b> "  + entry.usages[g];
						}
						//usageString = usageString + entry.usages[g] + "<br />";
					}
				}
				
				if( !isNumber ) {
					//console.log("Is not a number");
					if (entryInitalLetter != "") {
						html = html + createHeadline(entryInitalLetter);
					}
					if (entryInitalLetter != "") {
						currentLetter = entryInitalLetter;
					}
				}
				else {
					if (currentLetter != "#") {
						currentLetter = "#";
						html = html + createHeadline("#");
					}
				}
				
				html = html + createEntry(true, definitions, lexemeCount, entry.lexClass, entry.definition, entry.irregular, entry.ipa, usageString);
			}
			
			// Show lexicon
			setContent(html);
			setWordcount(wordcount);
		}
	);
}

function setContent(value) {
	$("#container").html(value);
}

function setWordcount(value) {
	$("#wordcount").html("Total lexemes: " + value);
}

function getInitialLetterChangedIfChanged(queryString, currentLetter) {
	queryString = $.trim(queryString).toLowerCase();
	if  ( queryString.charAt(0) != currentLetter ) {
		return queryString.charAt(0);
	}
	else {
		return "";
	}
}

function createHeadline(text) {
	return "<h1>" + text + "</h1>";
}

function createEntry(isCantade, lexeme, lexemeCount, lexClass, definition, irregular, ipa, usage) {	
	var irregularMark = "";
	if (irregular) {
		irregularMark = "*";
	}
	
	if (ipa != "") {
		ipa = " [" + ipa + "]";
	}
	
	if (usage != "") {
		usage = "<br /><span class='usage'>" + usage + "</span>";
	}
	
	var 		result = "<p>";
	
	if (isCantade) {
		result = 	result + "<span class='lexeme'>" + definition + "</span> ";
		result = 	result + "<span class='ipa'>" + ipa + "</span> ";
		result = 	result + "<span class='class " + lexClass + "'>" + lexClass + "</span> ";
		result = 	result + "<span class='definition'>" + lexeme + "</span>";
		result = 	result + "<span class='irregular'>" + irregularMark + "</span>";
		result = 	result + usage;
	}
	// ENGLISH
	else {
		result = 	result + "<span class='lexeme'>" + definition + "</span>";
		if (lexemeCount > 1) {
			//result = 	result + "<span class='lexemeCount'>" + lexemeCount + "</span> ";
		}
		result = 	result + " <span class='class " + lexClass + "'>" + lexClass + "</span> ";
		result = 	result + "<span class='definition'>" + lexeme + "</span>";
		result = 	result + "<span class='irregular'>" + irregularMark + "</span>";
		result = 	result + "<span class='ipa'>" + ipa + "</span>";
		result = 	result + usage;
	}
	result = 	result + "</p>";
		
	return result;
}