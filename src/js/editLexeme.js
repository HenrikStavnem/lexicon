function initNewWord() {
	//TODO
	console.info("TODO initNewWord");

	var classSelect = populateWordClassSelect();

	var html = `
      <br /><br />
		<div class='newWord col_left'>

			<div class='row'>
				<div id='new-entry-foreign-preview' class='preview-box'></div>
		      <div id='new-entry-local-preview' class='preview-box blue'></div>
	      </div>

			<div class='newWord input-col'>
				<span class='newWord input-headline'>Lexeme</span>
				<input type='text' id='input_lexeme' 		class='input-listen' placeholder="Lexeme" /><br />

				<span class='newWord input-headline'>Definition</span>
				<input type='text' id='input_definition' 	class='input-listen' placeholder="Definition" /><br />

				<span class='newWord input-headline'>Class</span>
				${classSelect}<br />

				<span class='newWord input-headline'>IPA</span>
				<input type='text' id='input_ipa' 					class='input-listen' placeholder="IPA" /><br />

				<span class='newWord input-headline'>Usage</span>
				<input type='text' id='input_usage' 				class='input-listen' placeholder="Usage" /><br />

				<span class='newWord input-headline'>Phrases</span>
				<input type='text' id='input_phrases' 				class='input-listen' placeholder="Phrases" /><br />

				<span class='newWord input-headline'>Etymology</span>
				<input type='text' id='input_etymology' 			class='input-listen' placeholder="Etymology" /><br />

				<span class='newWord input-headline'>Native Orthography</span>
				<input type='text' id='input_native_orthography' class='input-listen' placeholder="Native orthography" /><br />

				<input type='button' value='Save' id='edit-lexeme-save-btn'/>
			</div>

		</div>
		<div class='newWord col_right'>

			<div>TODO: Latest lexemes HERE</div>
			<div>TODO: GOALS HERE</div>

		</div>
   `;

	setContent(html);

	// Input listeners
	$('.input-listen').bind('input',function() {
		console.log("input listener");
		var lookupLocal = $('#input_definition').val();

		if (lookupLocal != "") {
			getWordlistAsJson("local", lookupLocal, parseInputsToNewWordJson("local"), "preview-local");
		}
		else {
			$("#new-entry-local-preview").html("");
		}

		var lookupForeign = $('#input_lexeme').val();
		if (lookupForeign != "") {
			getWordlistAsJson("foreign", lookupForeign, parseInputsToNewWordJson("foreign"), "preview-foreign");
		}
		else {
			$("#new-entry-foreign-preview").html("");
		}
	});

	$('#edit-lexeme-save-btn').bind('click',function() {
		saveNewWord();
	});
}

function setLocalPreview(html) {
	$("#new-entry-local-preview").html(html);
}

function setForeignPreview(html) {
	$("#new-entry-foreign-preview").html(html);
}

function populateWordClassSelect() {
	var html = "<select id='input_lexClass' class='input-listen'>"
		 classes = ["noun","verb","adjective","pronoun","adverb","article","particle","preposition","interjection","number","determiner","proper noun","conjunction","prefix","suffix","affix","infix","circumfix"]; // Todo: Add the rest of the classes

	classes.forEach(function(cls) {
		html = html + `<option>${cls}</option>`;
	});
	html = html + "</select>";

	return html;
}

function parseInputsToNewWordJson(direction) {
	var newWordJson,
		 lexeme 		= $('#input_lexeme').val(),
		 definition = $('#input_definition').val(),
		 lexClass	= $('#input_lexClass').val(),
		 ipa			= $('#input_ipa').val(),
		 usage		= $('#input_usage').val(),
		 phrases		= $('#input_phrases').val(),
		 etymology	= $('#input_etymology').val();
		 natOrth		= $('#input_native_orthography').val();

	if (direction == "foreign") {
		newWordJson = {"lexeme":lexeme,"definitions":{"0":{"lexeme":definition,"lexClass":lexClass,"ipa":ipa,"usage":usage,"example":phrases,"etymology":etymology,"irregular":false, "nativeOrthography" : natOrth}}};
	}
	else if (direction == "local") {
		newWordJson = {"lexeme":definition,"definitions":{"0":{"lexeme":lexeme,"lexClass":lexClass,"ipa":ipa,"usage":usage,"example":phrases,"etymology":etymology,"irregular":false, "nativeOrthography" : natOrth}}};
	}

	return newWordJson;
}

function saveNewWord() {
	var newWordAsJson = parseInputsToNewWordJson("foreign"), // words in the DB is saved as foreign
		 call = "saveNewWord";

	$.post( connection, {
		call: call,
		newWord: newWordAsJson
	} )
    .done(
		function( data ) {
			console.log(data);
			// callback function
		}
	);
}
