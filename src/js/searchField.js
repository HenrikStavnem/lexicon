function initSearchField() {
   var html = `
      <select>
         <option>Local</option>
         <option>Global</option>
      </select>
      <input type='text' id='' class='search-field' placeholder='Search...' />
   `;

   $( "#search-field-container" ).html(html);
}
