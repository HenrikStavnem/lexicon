function initMenu() {
   var html = `
      <div class='menu-left'>
         <div id="lexicon-headline"></div>
         <div class='menu-switch'>
            <img src='res/images/switch.svg' alt='Switch' class='switch-button' id='lexicon-direction-button' />
         </div>
         <button id='lexicon-picker-btn'>Select</button>
      </div>

      <div class='menu-right'>
         <button id='new-word-button'>Init new word</button>
         <button onClick='createWordEntry()'>Init word entry</button>
         <button onClick='testWordEntry()'>TEST word entry</button>
         <button onClick='login()' value='Login TEST'>Login test</button>
         <button>Settings</button>
      </div>

      <!-- Lexiocn Picker -->
      <div id='lexicon-picker'>
      </div>

      <div id='search-field-container'></div>
   `;

   $("#menu").html(html);
   $( "#lexicon-picker" ).hide();
   initSearchField();

   $( "#lexicon-picker-btn" ).on( "click", function() {
      toggleLexiconPicker();
   });
}

function populateLexiconPicker() {
	var optionsHtml = "";
	$.post( connection, {
		call: "getLexiconList"
	} )
	.done(
		function( data ) {
			var lexiconList = JSON.parse(data);

			for (var i in lexiconList) {
            // TODO: We need to repopulate this picker when lexicon direction changes
            // and when a new lexicon is added after launch. But for now, let's keep it at this.

            // Local to foreign
            if (lexiconDirection === 'local') {
               optionsHtml = optionsHtml + "<div id='lexicon_id_" + i + "' class='lexicon-picker-item' data-value='" + lexiconList[i].internalName + "'>" + lexiconList[i].targetLang + " &mdash; " + lexiconList[i].namePrefix + lexiconList[i].lexiconName + lexiconList[i].nameSuffix + "</div>";
            }
            // Foreign to local
            else{
               optionsHtml = optionsHtml + "<div id='lexicon_id_" + i + "' class='lexicon-picker-item' data-value='" + lexiconList[i].internalName + "'>" +  lexiconList[i].namePrefix + lexiconList[i].lexiconName + lexiconList[i].nameSuffix + " &mdash; " + lexiconList[i].targetLang + "</div>";
            }
			}

			$( "#lexicon-picker" ).html(optionsHtml);
         bindLexiconPickerItem();
		}
	);
}

function toggleLexiconPicker() {
   $( "#lexicon-picker" ).toggle();
}

function getLexiconPickerItemIdFromEvent(rawId) {
	return result = rawId.replace("lexicon_id_","");
}

function bindLexiconPickerItem() {
   console.log("binding Lexicon picker items click event");
   $( ".lexicon-picker-item" ).on( "click", function(event) {
      var 	id         = getLexiconPickerItemIdFromEvent(event.target.id),
            pickerItem = $("#" + event.target.id),
            value      = pickerItem.data('value');

      console.log("picker target id ::: " + event.target.id);
      console.log("picker value ::: " + value);

      setSelectedLanguage(value);
      pop();
      toggleLexiconPicker();
   });
}
