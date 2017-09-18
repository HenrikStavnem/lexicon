function initNewWord() {
	//TODO
	console.info("TODO initNewWord");

	var classSelect = populateWordClassSelect();

	var html = `
      <br /><br />
		<div class='newWord col_left'>

			<div class='row'>
				<div id='new-entry-foreign-preview' class='preview-box'></div>
		      <div id='new-entry-local-preview' class='preview-box'></div>
	      </div>

			<div class='input-col'>
				<span class='newWord input-headline'>Lexeme</span>
				<input type='text' id='input_lexeme' 		class='input-listen' placeholder="Lexeme" /><br />

				<span class='newWord input-headline'>Definition</span>
				<input type='text' id='input_definition' 	class='input-listen' placeholder="Definition" /><br />

				<span class='newWord input-headline'>Class</span>
				${classSelect}<br />

				<span class='newWord input-headline'>Usage</span>
				<input type='text' id='input_usage' 	class='input-listen' placeholder="Usage" /><br />
			</div>

		</div>
		<div class='newWord col_right'>

			<div>TODO: Latest lexemes HERE</div>
			<div>TODO: GOALS HERE</div>

		</div>
   `; // todo: implement

	setContent(html);

	// Input listeners
	$('#input_definition').bind('input',function() {
		var lookup = $('#input_definition').val();
		if (lookup != "") {
			getWordlistAsJson("local", lookup, parseInputsToNewWordJson("local"), "preview-local");
		}
		else {
			$("#new-entry-local-preview").html("");
		}
	});

	$('#input_lexeme').bind('input',function() {
		console.log("lexeme get");
		var lookup = $('#input_lexeme').val();
		if (lookup != "") {
			getWordlistAsJson("foreign", lookup, parseInputsToNewWordJson("foreign"), "preview-foreign");
		}
		else {
			$("#new-entry-foreign-preview").html("");
		}
	});
}

function setLocalPreview(html) {
	$("#new-entry-local-preview").html(html);
}

function setForeignPreview(html) {
	$("#new-entry-foreign-preview").html(html);
}

function populateWordClassSelect() {
	var html = "<select>"
		 classes = ["noun","verb","adjective"]; // Todo: Add the rest of the classes

	classes.forEach(function(cls) {
		html = html + `<option>${cls}</option>`;
	});
	html = html + "</select>";

	return html;
}

function parseInputsToNewWordJson(direction) {
	var newWordJson,
		 lexeme = $('#input_lexeme').val(),
		 definition = $('#input_definition').val();

	if (direction == "foreign") {
		newWordJson = {"lexeme":lexeme,"definitions":{"0":{"lexeme":definition,"lexClass":"noun","ipa":"ipa","usage":"local","example":"This is an example phrase","etymology":"etymology","irregular":false}}};
	}
	else if (direction == "local") {
		newWordJson = {"lexeme":definition,"definitions":{"0":{"lexeme":lexeme,"lexClass":"noun","ipa":"ipa","usage":"foreign","example":"How this could look like","etymology":"etymology","irregular":false}}};
	}

	return newWordJson;
}
