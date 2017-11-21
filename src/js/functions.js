var 	connection = "src/php/db.php",
		session = "src/php/session.php",
		useAbbreviations = false,
		showEtymologies = true;
		showNativeOrthography = true;
		selectedLang = null,
		lexiconDirection = "local"
	;

function pop() { // TODO: Need better name
	console.info("pop");
	getWordlistAsJson(lexiconDirection, "", null, "lexicon");
}

function getWordlistAsJson(lexiconDirection, lookup, newWord, callback) {
	var 	call = "getWordlistLocalSorted",
			wordlist;

	if (lexiconDirection != "local") {
		call = "getWordlistForeignSorted";
	}

	$.post( connection, {
		call: call,
		lookup: lookup,
		newword: newWord
	} )
    .done(
		function( data, wordlist ) {
			wordlist = data;

			console.log(data);

			getWordlistCallback(wordlist, callback);
		}
	);
}

function getWordlistCallback(wordlist, callback) {
	switch (callback) {
		case "lexicon": 				populateWordlist(wordlist, "lexicon"); 			break;
		case "preview-local": 		populateWordlist(wordlist, "preview-local"); 	break;
		case "preview-foreign": 	populateWordlist(wordlist, "preview-foreign");	break;
	}
}

function populateDestination(html, destination) {
	console.log("populateDestination to " + destination);
	switch (destination) {
		case "lexicon": 				setContent(html); 			break;
		case "preview-local": 		setLocalPreview(html);		break;
		case "preview-foreign": 	setForeignPreview(html);	break;
	}
}

function populateWordlist(wordlist, destination) {
	console.log("populateWordList");
	//console.log(wordlist);
	var html = "<div class='lexicon'>";
	var currentLetter = "";
	var previousLexeme = "";
	var numbers = ["0", "1", "2", "3", "4" ,"5", "6", "7", "8" , "9"];
	var wordcount = 0;

	if(wordlist) {
		try {
			var entries = JSON.parse(wordlist);
		}
		catch(e) {
			setContent(e + ": " + wordlist);
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
				"lexId" 		: entries.lexemes[i].definitions[j].lexId,
				"lexeme" 	: entries.lexemes[i].definitions[j].lexeme,
				"lexClass" 	: entries.lexemes[i].definitions[j].lexClass,
				"ipa" 		: entries.lexemes[i].definitions[j].ipa,
				"usage" 		: entries.lexemes[i].definitions[j].usage,
				"example" 	: entries.lexemes[i].definitions[j].example,
				"etymology" : entries.lexemes[i].definitions[j].etymology,
				"irregular" : entries.lexemes[i].definitions[j].irregular,
				"nativeOrthography" : entries.lexemes[i].definitions[j].nativeOrthography
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

		html = html + createEntry(lexeme, lexClass, definitions);
	}

	html = html + "</div>";

	// Show lexicon
	//setContent(html);
	populateDestination(html, destination);
	bindWordlistListerners();
	setWordcount(wordcount);
}

function init(call) {

	switch(call) {
		case "lex_test": test(); break;
		case "lex_ec"	: pop(); /*populateWordListLocal();*/  break;
		case "lex_ce"	: populateWordListForeign(); break;
		case "newword"	: initNewWord(); break;
	}

	initMenu();

	$( ".input-check-listen" ).on( "change", function() {

		useAbbreviations 			= $( "#settings-use-abbreviations" ).is(":checked");
		showEtymologies 			= $( "#settings-show-etymologies" ).is(":checked");
		showNativeOrthography	= $( "#settings-show-native-orthography" ).is(":checked");

		pop();
	});

	$( "#lexicon-direction-button" ).on( "click", function() {
		changeLexiconDirection();
	});

	$( "#new-word-button" ).on( "click", function() {
		initNewWord();
	});

	populateLexiconPicker();
}

function changeLexiconDirection() {
	console.log("changeLexiconDirection");
	if (lexiconDirection == "local") {
		lexiconDirection = "foreign";
	} else {
		lexiconDirection = "local";
	}

	getWordlistAsJson(lexiconDirection, "", null, "lexicon");
	//populateWordlist_OLD();
}

function setSelectedLanguage(val) {
	$.post( session, {
		call: "setSelectedLanguage",
		newLang: val
	} )
	.done(
		function( data ) {
			console.log("Session says: " + data);
		}
	);
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

function testWordEntry() {
	$.post( connection, {
		call: "getWordEntry"
	} )
	.done(
		function( data ) {
			console.log(data);
		}
	);
}

function testLatestWordsAdded() {
	$.post( connection, {
		call: "getLatestWordsAdded"
	} )
	.done(
		function( data ) {
			console.log(data);
		}
	);
}

function createLexiconHeadline(conlang, conlangPrefix, conlangSuffix, targetLang) {
	if (lexiconDirection == 'local') {
		console.log("headline local");
		$("#lexicon-headline").html(capitalizeString(targetLang) + " &mdash; <span class='langPrefix'>" + conlangPrefix + "</span>" + capitalizeString(conlang) + "<span class='langSuffix'>" + conlangSuffix + "</span>");
	}
	else {
		console.log("headline foreign");
		$("#lexicon-headline").html("<span class='langPrefix'>" + conlangPrefix + "</span>" + capitalizeString(conlang) + "<span class='langSuffix'>" + conlangSuffix + "</span> &mdash; " + capitalizeString(targetLang));
	}
}

function populateWordListLocal() {
	//console.log("populateWordListLocal");
	setContent("<h1>Fetching data...</h1>");

	$.post( connection, {
		call: "getWordlistLocalSorted",
		lookup: ""
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
				var lexId 			= entries.lexemes[i].lexId;
				var definitions	= Array();

				var entryInitalLetter = getInitialLetter(lexeme);
				var isNumber = jQuery.inArray(entryInitalLetter, numbers) !== -1;

				for (var j in entries.lexemes[i].definitions) {
					definitions[j] = {
						"lexeme" 	: entries.lexemes[i].definitions[j].lexeme,
						"ipa" 		: entries.lexemes[i].definitions[j].ipa,
						"usage" 		: entries.lexemes[i].definitions[j].usage,
						"example" 	: entries.lexemes[i].definitions[j].example,
						"etymology" : entries.lexemes[i].definitions[j].etymology,
						"irregular" : entries.lexemes[i].definitions[j].irregular
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

				html = html + createEntry(lexeme, lexClass, definitions);
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

function getInitialLetter(queryString, currentLetter) {
	queryString = $.trim(queryString).toLowerCase();
	return queryString.charAt(0);
}

function createHeadline(text) {
	return "<h1>" + text + "</h1>";
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// URL manipulation for later use:
// window.history.pushState("object or string", "Title", "/new-url");
