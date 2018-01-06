function populateWordList(entries, destination) {
	var html = "<div class='lexicon'>",
		 currentLetter = "",
		 previousLexeme = "",
		 numbers = ["0", "1", "2", "3", "4" ,"5", "6", "7", "8" , "9"],
		 wordcount = 0;

	//createLexiconHeadline(entries.conlang, entries.conlangPrefix, entries.conlangSuffix, entries.targetLang);

	// Create headline
	createLexiconHeadline(entries.conlang, entries.conlangPrefix, entries.conlangSuffix, entries.targetLang);

	for (var i in entries.lexemes) {
		wordcount++;

		var lexemeEntry	= entries.lexemes[i],
		lexemeOld			= entries.lexemes[i].lexeme,
		lexClass 			= entries.lexClass,
		lexId 				= entries.lexId,
		definitions			= Array(),
		entryInitalLetter = getInitialLetter(entries.lexemes[i].lexeme),
		isNumber 			= jQuery.inArray(entryInitalLetter, numbers) !== -1;

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
		html = html + createEntry(lexemeEntry);
	}

	html = html + "</div>";

	// Show lexicon
	populateDestination(html, destination);
	bindWordlistListerners();
	setWordcount(wordcount);
}

function createEntry(lexemeEntry) {
	//debugger;
	var 	result = "<p>",
			lexeme				= lexemeEntry.lexeme,
			lexemeId				= lexemeEntry.lexemeId,
			lexemeClass 		= lexemeEntry.lexClass,
			lexemeIpa 			= lexemeEntry.lexemeIpa,
			definitions			= lexemeEntry.definitions,
			nativeOrthography	= lexemeEntry.nativeOrthography,
			isDefinitionsMany = false;

	// convert definitions object to Array
	var definitions = Object.values(definitions);

	result = result + "<span class='lexeme'>" + lexeme + "</span>";

	if (lexiconDirection == "foreign") {
		result = result + "<span class='native'> " + lexeme + "</span>";

		if (lexemeIpa !== "" && lexemeIpa !== undefined) {
			//result = 	result + " <span class='ipa'>[" + replaceAll(lexemeIpa, ":", "&#x2D0;") + "]</span>";
			result = 	result + " <span class='ipa'>[" + lexemeIpa + "]</span>";
		}
	}

	result = result + " <span class='class " + lexemeClass + "'>" + lexemeClass + "</span> ";

	if (definitions.length === 1) {
		//result = result + " (kun éen du)";
	} else {
		//result = result + " (ja da større end 1 baby)";
		isDefinitionsMany = true;
	}

	for (var i in definitions) {
		result = result + createEntryDefinition(definitions[i], isDefinitionsMany, i, lexemeId);
	}

	result = 	result + "</p>";
	return result;
}

function createEntryDefinition(definition, isDefinitionsMany, index, lexemeId) {
	var result = "",
		 number = (parseInt(index) + 1);

	if (isDefinitionsMany) {
		result = result + "<br /><span class='label'> " + number + ":</span> ";
	}

	result = result + "<span class='definition word-entry' id='word-id-" + lexemeId + "' '>" + definition.lexeme + "</span>"

	if (lexiconDirection === "local") {
		result = result + "<span class='native'> " + definition.lexeme + "</span>";
		if (definition.lexemeIpa !== "" && definition.lexemeIpa !== undefined) {
			result = 	result + " <span class='ipa'>[" + definition.lexemeIpa + "]</span>";
		}
	}

	if (definition.usage !== "") {
		result = 	result + "<br /><span class='usage'>" + definition.usage + "</span>";
	}

	if (definition.examples !== "") {
		result = 	result + "<br><span class='label'>Phrases:</span> ";
		result = 	result + "<span class='usage'>" + definition.examples + "</span>";
	}

	return result; //"<br />" + definition.lexeme;;
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

function bindWordlistListerners() {
	console.log("bindWordlistListerners");
	$( ".word-entry" ).on( "click", function(event) {
		var id = event.target.id;
		console.log(id);
	});
}
