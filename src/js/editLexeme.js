function initNewWord() {
	//TODO
	console.info("TODO initNewWord");

	var html = `
      <br /><br />
		<div class='newWord col_left'>

			<div class='row'>
				<div id='new-entry-foreign-preview' class='preview-box'></div>
		      <div id='new-entry-local-preview' class='preview-box'></div>
	      </div>

			<div class='input-col'>
				<input type='text' id='input_lexeme' 		class='input-listen' placeholder="Lexeme" />
				<input type='text' id='input_definition' 	class='input-listen' placeholder="Definition" />
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
		var value = $('#input_definition').val();
		if (value != "") {
			getWordlistAsJson("local", value, "preview-local");
		}
		else {
			$("#new-entry-local-preview").html("");
		}
	});

	$('#input_lexeme').bind('input',function() {
		console.log("lexeme get");
		var value = $('#input_lexeme').val();
		if (value != "") {
			getWordlistAsJson("foreign", value, "preview-foreign");
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
