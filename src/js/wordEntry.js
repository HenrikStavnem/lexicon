function createWordEntry() {
   var html;

   html = `
      <div class='word-entry-box'>
         <h2>CUOSTRA</h2>
         1. <i>verb</i> drain out<br />
         2. <i>verb</i> exhaust
         <br /><br />
         Etymology: From <i>cu</i> out (from Middle-Cantade <i>co</i> out) and <i>ostra</i> drain (from Middle-Cantade <i>o</i> empty (from Old-Cantade <i>ow</i> empty) and Middle-Cantade <i>stra</i> make-as)
         <br /><br />
         Formatted as:<br/>
         Etymology: From {1:312} (from {2:42}) and {1:1201} (from {2:109} (from {3:73}) and {2:998})
         <br /><br />
         Inputted as as:<br/>
         Etymology: From {1:312} and {1:1201}

         <br /><br /><b>Related entries:</b><br />
         <div class='word-entry-tag'>ostra</div>
         <div class='word-entry-tag'>ostra</div>
         <div class='word-entry-tag'>ostra</div>
         <div class='word-entry-tag'>ostra</div>

         <ul>
            <li>cuostra: to drain out</li>
            <ul>
               <li>cu: out</li>
                  <ul>
                     <li>co MC out</li>
                  </ul>
               <li>ostra drain</li>
               <ul>
                  <li>o MC empty</li>
                  <ul>
                     <li>ow OC empty</li>
                  </ul>
                  <li>stra MC make-as</li>
               </ul>
            </ul>
         </ul>

         <br /><br />
         <img src='https://research.google.com/bigpicture/images/mortgage.png' alt='picture' />
      </div>
   `;

   $("#container").html(html);
}
