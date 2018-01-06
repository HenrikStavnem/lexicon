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
			// TODO: What is the point of "wordlist?". It yields "success" from the DB. Why? What was it supposed to do?

			wordlist = JSON.parse(data);;

			//console.log(data);

			getWordlistCallback(wordlist, callback);
		}
	);
}

function getWordlistCallback(wordlist, callback) {
	switch (callback) {
		case "lexicon": 				populateWordList(wordlist, "lexicon"); 			break;
		case "preview-local": 		populateWordList(wordlist, "preview-local"); 	break;
		case "preview-foreign": 	populateWordList(wordlist, "preview-foreign");	break;
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
