var 	connection = 'src/php/db.php',
		useAbbreviations = false;
	;

function init(call) {
	//setContent("<h1>Initializing...</h1>");

	//populateWordlistCantade();
	switch(call) {
		case "lex_test": test(); break;
		case "lex_ec"	: populateWordlistEnglish(); break;
		case "lex_ce"	: populateWordlistCantade(); break;
		case "newword"	: initNewWord(); break;
	}

	$( ".input-check-listen" ).on( 'change', function() {
		console.log("Checked");

		if (useAbbreviations)
			useAbbreviations = false;
		else
			useAbbreviations = true;

		populateWordlistEnglish();
	});
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

function test() {
	setContent("<h1>Fetching data - TEST...</h1>");
	$.post( connection, {
		call: "getTest"
	} )
	.done(
		function( data ) {
			console.log(data);
			setContent(data);
		}
	);
}

function abbreviateLexemeClass(lexClass) {
	var result = "";

	// see https://eucbeniki.sio.si/ang1/3199/index1.html

	switch (lexClass) {
		case "noun": 			result = "n."; 		break;
		case "verb": 			result = "v."; 		break;
		case "adjective": 	result = "adj."; 		break;
		case "number": 		result = "num."; 		break;
		case "adverb": 		result = "adv."; 		break;
		case "preposition": 	result = "prep."; 	break;
		case "pronoun": 		result = "pron."; 	break;
		case "conjunction": 	result = "conj."; 	break;
		case "interjection": result = "interj."; 	break;
		case "determiner": 	result = "det."; 		break;
		case "particle": 		result = "part."; 	break;
		case "article": 		result = "art."; 		break;
		// TODO: proper noun
		default: result = lexClass;
	}

	return result;
}

function createEntryNew(isCantade, lexeme, lexClass, definitions, ipa) {
	var 	result = "<p>"
			lexemeClass = lexClass; // TODO: Only if setting is set to abbreviate

	if (useAbbreviations) {
		lexemeClass = abbreviateLexemeClass(lexClass)
	}

	//ipa = replaceAll("noget med : som er smart", ":", "&#x2D0;");
	ipa = replaceAll("noget med : som er smart", ":", "cool");
	console.log(ipa);

	// &#x2D0;

	result = 	result + "<span class='lexeme'>" + lexeme + "</span>";
	result = 	result + " <span class='class " + lexClass + "'>" + lexemeClass + "</span> ";

	if (definitions.length > 1)
	{
		for (var i in definitions) {
			var number = (parseInt(i) + 1);
			result = 	result + "<br /><span class='label'> " + number + ":</span> ";
			result = 	result + "<span class='definition'>" + definitions[i].lexeme + "</span> ";

			if (definitions[i].ipa != "") {
				result = 	result + "<span class='ipa'>[" + replaceAll(definitions[i].ipa, ":", "&#x2D0;") + "]</span>";
			}

			if (definitions[i].usage != "") {
				result = 	result + "<br /><span class='usage'>" + definitions[i].usage + "</span>";
			}

			if (definitions[i].example != "") {
				result = 	result + "<br><span class='label'>Phrases:</span> ";
				result = 	result + "<span class='usage'>" + definitions[i].example + "</span>";
			}

			if (definitions[i].etymology != "") {
				result = 	result + "<br><span class='label'>Etymology:</span>";
				result = 	result + "<span class='etymology'>[" + definitions[i].etymology + "]</span>";
			}
		}
	}
	else {
		result = 	result + "<span class='definition'>" + definitions[0].lexeme + "</span> ";
		if (definitions[0].ipa != "") {
			result = 	result + "<span class='ipa'>[" + replaceAll(definitions[0].ipa, ":", "&#x2D0;") + "]</span>";
		}

		if (definitions[0].usage != "") {
			result = 	result + "<br /><span class='usage'>" + definitions[0].usage + "</span>";
		}
		if (definitions[0].example != "") {
			result = 	result + "<br><span class='label'>Phrases:</span> ";
			result = 	result + "<span class='usage'>" + definitions[0].example + "</span>";
		}

		if (definitions[0].etymology !== "" && definitions[0].etymology !== undefined) {
			result = 	result + "<br><span class='label'>Etymology:</span> ";
			result = 	result + "<span class='etymology'>" + definitions[0].etymology + "</span>";
		}
	}

	result = 	result + "</p>";
	return result;
}

function createLexiconHeadline(conlang, conlangPrefix, conlangSuffix, targetLang) {
	$("#lexicon-headline").html("<h1>" + capitalizeString(targetLang) + " &mdash; " + conlangPrefix + capitalizeString(conlang) + conlangSuffix + "</h1>");
}

function populateWordlistEnglish() {
	console.log("populateWordlistEnglish");
	setContent("<h1>Fetching data...</h1>");
	$.post( connection, {
		call: "getWordlistEnglishSorted"
	} )
    .done(
		function( data ) {
			console.log(data);
			var html = "";
			var currentLetter = "";
			var previousLexeme = "";
			var numbers = ["0", "1", "2", "3", "4" ,"5", "6", "7", "8" , "9"];
			var wordcount = 0;

			if(data) {
				try {
					var entries = JSON.parse(data);
				}
				catch(e) {
					setContent(e + ": " + data);
					return;
				}
			}

			console.log(entries.conlang);
			createLexiconHeadline(entries.conlang, entries.conlangPrefix, entries.conlangSuffix, entries.targetLang);

			// Create headline


			for (var i in entries.lexemes) {
				wordcount++;

				var lexeme			= entries.lexemes[i].lexeme;
				var lexClass 		= entries.lexemes[i].lexClass;
				var definitions	= Array();

				var entryInitalLetter = getInitialLetter(lexeme);
				var isNumber = jQuery.inArray(entryInitalLetter, numbers) !== -1;

				for (var j in entries.lexemes[i].definitions) {
					definitions[j] = {
						"lexeme" : entries.lexemes[i].definitions[j].lexeme,
						"ipa" : entries.lexemes[i].definitions[j].ipa,
						"usage" : entries.lexemes[i].definitions[j].usage,
						"example" : entries.lexemes[i].definitions[j].example,
						"etymology" : entries.lexemes[i].definitions[j].etymology
					}
				}

				if (currentLetter != entryInitalLetter) {
					if( !isNumber ) { // isNumber false
						if (entryInitalLetter != "") {
							currentLetter = entryInitalLetter;
							html = html + createHeadline(entryInitalLetter);
						}
					}
					else {
						if (currentLetter != "#") {
							currentLetter = "#";
							html = html + createHeadline("#");
						}
					}
				}
				else {
					currentLetter = entryInitalLetter;
				}

				html = html + createEntryNew(false, lexeme, lexClass, definitions);
			}

			// Show lexicon
			setContent(html);
			setWordcount(wordcount);
		}
	);
}

function populateWordlistCantade() {
	console.log("changed");
	setContent("<h1>Fetching data...</h1>");
	$.post( connection, {
		call: "getWordlistCantadeSorted"
	} )
    .done(
		function( data ) {
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
					}
				}

				if( !isNumber ) {
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
	console.log("setWordCount");
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

function getInitialLetter(queryString, currentLetter) {
	queryString = $.trim(queryString).toLowerCase();
	return queryString.charAt(0);
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

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function capitalizeString(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
