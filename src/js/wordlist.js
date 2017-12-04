function createEntryNew(lexemeEntry) {
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

function createEntry(lexeme, lexClass, definitions, ipa) {
	var 	result = "<p>"
			lexemeClass = lexClass; // TODO: Only if setting is set to abbreviate

	if (useAbbreviations) {
		lexemeClass = abbreviateLexemeClass(lexClass)
	}

	//ipa = replaceAll("noget med : som er smart", ":", "&#x2D0;");
	ipa = replaceAll("noget med : som er smart", ":", "cool");
	//console.log(ipa);

	// &#x2D0;

	result = 	result + "<span class='lexeme'>" + lexeme + "</span>";

   if (lexiconDirection == "foreign") {
      result = 	result + "<span class='native'> " + definitions[0].nativeOrthography + "</span>";
      if (definitions[0].ipa != "") {
			result = 	result + " <span class='ipa'>[" + replaceAll(definitions[0].ipa, ":", "&#x2D0;") + "]</span>";
		}
   }
	//result = 	result + " <span class='class " + lexClass + "'>" + lexemeClass + "</span> ";

	if (definitions.length > 1)
	{
		for (var i in definitions) {
			var number = (parseInt(i) + 1);
			var lexemeClass =  definitions[i].lexClass;
			if (useAbbreviations) {
				lexemeClass = abbreviateLexemeClass(lexemeClass)
			}

			result = 	result + "<br /><span class='label'> " + number + ":</span> ";
			result = 	result + " <span class='class " + definitions[i].lexClass + "'>" + lexemeClass + "</span> ";
			result = 	result + "<span class='definition word-entry' id='word-id-" + definitions[i].lexId + "' '>" + definitions[i].lexeme + "</span>";

         if (lexiconDirection == "local" && showNativeOrthography) {
	         result = 	result + "<span class='native'> " + definitions[i].nativeOrthography + "</span>";
         }

			if (definitions[i].irregular) {
				result = 	result + "* ";
			} else {
				result = 	result + " ";
			}

			if (definitions[i].ipa != "" && lexiconDirection == "local") {
				result = 	result + "<span class='ipa'>[" + replaceAll(definitions[i].ipa, ":", "&#x2D0;") + "]</span>";
			}

			if (definitions[i].usage != "") {
				result = 	result + "<br /><span class='usage'>" + definitions[i].usage + "</span>";
			}

			if (definitions[i].example != "") {
				result = 	result + "<br><span class='label'>Phrases:</span> ";
				result = 	result + "<span class='usage'>" + definitions[i].example + "</span>";
			}

			if (definitions[i].etymology != "" && showEtymologies) {
				result = 	result + "<br><span class='label'>Etymology:</span>";
				result = 	result + "<span class='etymology'>" + definitions[i].etymology + "</span>";
			}
		}
	}
	else {
		var lexemeClass =  definitions[0].lexClass;
		if (useAbbreviations) {
			lexemeClass = abbreviateLexemeClass(lexemeClass)
		}
		result = 	result + " <span class='class " + definitions[0].lexClass + "'>" + lexemeClass + "</span> ";
		result = 	result + "<span class='definition word-entry' id='word-id-" + definitions[0].lexId + "' >" + definitions[0].lexeme + "</span>";

      if (lexiconDirection == "local" && showNativeOrthography) {
   		result = 	result + "<span class='native'> " + definitions[0].nativeOrthography + "</span>";
      }

		if (definitions[0].irregular) {
			result = 	result + "* ";
		} else {
			result = 	result + " ";
		}

		if (definitions[0].ipa != "" && lexiconDirection == "local") {
			result = 	result + "<span class='ipa'>[" + replaceAll(definitions[0].ipa, ":", "&#x2D0;") + "]</span>";
		}

		if (definitions[0].usage != "") {
			result = 	result + "<br /><span class='usage'>" + definitions[0].usage + "</span>";
		}
		if (definitions[0].example != "") {
			result = 	result + "<br><span class='label'>Phrases:</span> ";
			result = 	result + "<span class='usage'>" + definitions[0].example + "</span>";
		}

		if (definitions[0].etymology !== "" && definitions[0].etymology !== undefined  && showEtymologies) {
			result = 	result + "<br><span class='label'>Etymology:</span> ";
			result = 	result + "<span class='etymology'>" + definitions[0].etymology + "</span>";
		}
	}

	result = 	result + "</p>";
	return result;
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
