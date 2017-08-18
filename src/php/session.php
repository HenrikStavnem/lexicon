<?php
   session_start();

   $call 	= $_POST['call'];

   switch($call) {
      case "setSelectedLanguage":
         $newLang 	= $_POST['newLang'];

         $_SESSION["selectedLang"] = $newLang;
         echo $_SESSION["selectedLang"];
         break;
   }

?>
