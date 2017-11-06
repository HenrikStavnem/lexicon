<?php

   function login($mysqli) {
      $inputEmail    = '';
      $inputPassword = '';

      if (isset($_POST['email'])) {
         $inputEmail    = $_POST['email'];
      }
      if (isset($_POST['password'])) {
         $inputPassword    = $_POST['password'];
      }

      if ($inputEmail === '' || $inputPassword === '') {
         echo "Hey man, no inputs";
         return false;
      }
      else {
         echo "response: $inputEmail | $inputPassword";
      }

      echo "\nEncrypted password is: " . encryptPasswordString($inputPassword, "henrikstavnem") . "\n";

      $stmlLogin = $mysqli->prepare("
			SELECT
				user_id, user_first_name, user_last_name, user_avatar, user_password, user_email
			FROM
				lexicon_users
			WHERE
				user_email = ?
			LIMIT
				1
		");

      $inputEmail = 'henrik@stavnem.net';

		$stmlLogin->bind_param('s', $inputEmail);
		$stmlLogin->execute();
		$stmlLogin->store_result();
		$stmlLogin->bind_result($id, $firstname, $lastname, $avatar, $password, $email);

      while($row = $stmlLogin->fetch()) {
         if (validatePassword($inputPassword, $password)) {
            echo "login success";
         }
         else {
            echo "login failure";
         }
      }
   }

   function validatePassword($inputPassword, $password) {
      if ($inputPassword === $password) {
         return true;
      }
      else {
         return false;
      }
   }

   /**
      Encrypts a password by using the RAW password along with username
   */
   function encryptPasswordString($password, $username) {
      $preparedString = $username . "telcontar" . $password . "elessar";
      $preparedString = strrev($preparedString);
      echo "\n$preparedString \n";
      $result = password_hash($preparedString, PASSWORD_DEFAULT);
      return $result;
   }

?>
