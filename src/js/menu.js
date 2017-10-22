function initMenu() {
   var html = `
      <div id='menu'>
         <div id="lexicon-headline"></div>
      </div>
   `;

   $("#menu").html(html);
}

function populateLexiconSelector() {
	var optionsHtml = "";
	$.post( connection, {
		call: "getLexiconList"
	} )
	.done(
		function( data ) {
			console.log("populateLexiconSelector: " + data);

			var lexiconList = JSON.parse(data);

			for (var i in lexiconList) {
				optionsHtml = optionsHtml + "<option value='" + lexiconList[i].internalName +"'>" + lexiconList[i].namePrefix + lexiconList[i].lexiconName + lexiconList[i].nameSuffix + "</option>";
			}

			$( "#lexicon-selector" ).html("<select id='select-language'>" + optionsHtml + "</select>");

			$( "#select-language" ).on( "change", function() {
				var val = $( "#select-language" ).val();
				setSelectedLanguage(val);

				pop();
			});
		}
	);
}
