<?php

	session_start();
	date_default_timezone_set('Europe/Copenhagen');
	
	$call 	= $_POST['call'];
	
	$mysqli = new mysqli("l", '', '', '');
    if (mysqli_connect_errno()) {
        echo "<br />";
		printf("Connect failed: %s\n", mysqli_connect_error());
		exit();
	}
	
	$mysqli->set_charset("utf8");
	
	switch($call) {
		case "getWordlistCantadeSorted"	:	getWordlistCantadeSorted($mysqli);	break;
		case "getWordlistEnglishSorted"		:	getWordlistEnglishSorted($mysqli);		break;
	}
	
	function getWordlistEnglishSorted($mysqli) {	
		$stmt = $mysqli->prepare("
			SELECT
				id, word, word_clarification, class, definition, definition_clarification, pronounciation,
				etymology, irregular, verb_conjugation, pronoun_subclass, word_usage, note, new 
			FROM
				cantade
			ORDER BY
				definition, word ASC
			");
			
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($id, $lex, $lexClarification, $class, $definitionAsIs, $definitionClarification, $pronounciation, $etymology, $irregular, $verbConjugation, $pronounSubclass, $usage, $note, $new);
		
		$result = array();
		
		while($row = $stmt->fetch()) {
			
			// Analyze and alter data before encoding
			
			// Splitting multiple definitions into several entries
			$definitionsArray = explode(",", $definitionAsIs);
			//$definitions = Array();
			
			foreach($definitionsArray as $definition) {
				
				// Check if identical definition is already found
				$key = array_search($definition, array_column($result, 'definition'));
				
				if ($key === false) {
					// New entry					
						$result[] = array(
							"id" 				=> $id,
							"lexClass" 	=> $class,
							"lexeme" 		=> array( "lex" => $lex ), 
							"definition" 	=> trim($definition),
							"irregular"		=> $irregular,
							"ipa" 			=> $pronounciation,
							"usages"		=> array( "usage" => $usage )
						);
				}
				else {
					//$result[$key]["lexeme"]["lex"] = "DUPLICATE of $definition. OLD: " . $result[$key]["lexeme"]["lex"] . " NEW: $lex";
					
					// Check if found word is same class
					if ($result[$key]["lexClass"] == $class) {
						array_push($result[$key]["lexeme"], $lex);
						array_push($result[$key]["usages"], $usage);
					}
					// Entry is unique after all
					else {
						// New entry					
						$result[] = array(
							"id" 				=> $id,
							"lexClass" 	=> $class,
							"lexeme" 		=> array( "lex" => $lex ), // $lex
							"definition" 	=> trim($definition),
							"irregular"		=> $irregular,
							"ipa" 			=> $pronounciation,
							"usages"		=> array( "usage" => $usage )
						);
					}					
				}
			}			
		}
		
		// Sort array
		$result = array_orderby($result, 'definition', SORT_ASC, 'lexClass', SORT_ASC);
		
		asort($result);
		echo json_encode($result);
	}
	
	function getWordlistCantadeSorted($mysqli) {	
		$stmt = $mysqli->prepare("
			SELECT
				id, word, word_clarification, class, definition, definition_clarification, pronounciation,
				etymology, irregular, verb_conjugation, pronoun_subclass, word_usage, note, new 
			FROM
				cantade
			ORDER BY
				definition ASC
			");
			
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($id, $definitionAsIs, $lexClarification, $class, $lex, $definitionClarification, $pronounciation, $etymology, $irregular, $verbConjugation, $pronounSubclass, $usage, $note, $new);
		
		$result = array();
		
		while($row = $stmt->fetch()) {
			
			// Analyze and alter data before encoding
			
			// Splitting multiple definitions into several entries
			$definitionsArray = explode(",", $definitionAsIs);
			//$definitions = Array();
			
			foreach($definitionsArray as $definition) {
				
				// Check if identical definition is already found
				$key = array_search($definition, array_column($result, 'definition'));
				
				if ($key === false) {
					// New entry					
						$result[] = array(
							"id" 						=> $id,
							"lexClass" 			=> $class,
							"lexeme" 				=> array( "lex" => $lex ), 
							"definition" 			=> trim($definition),
							"defClarification"	=> $definitionClarification,
							"irregular"				=> $irregular,
							"ipa" 					=> $pronounciation,
							"usages"				=> array( "usage" => $usage )
						);
				}
				else {
					//$result[$key]["lexeme"]["lex"] = "DUPLICATE of $definition. OLD: " . $result[$key]["lexeme"]["lex"] . " NEW: $lex";
					
					// Check if found word is same class
					if ($result[$key]["lexClass"] == $class) {
						array_push($result[$key]["lexeme"], $lex);
						array_push($result[$key]["usages"], $usage);
					}
					// Entry is unique after all
					else {
						// New entry					
						$result[] = array(
							"id" 						=> $id,
							"lexClass" 			=> $class,
							"lexeme" 				=> array( "lex" => $lex ), // $lex
							"definition" 			=> trim($definition),
							"defClarification"	=> $definitionClarification, // MUST BE A LIST LIKE USAGES AND DEFS
							"irregular"				=> $irregular,
							"ipa" 					=> $pronounciation,
							"usages"				=> array( "usage" => $usage )
						);
					}					
				}
			}			
		}
		
		// Sort array
		$result = array_orderby($result, 'definition', SORT_ASC, 'lexClass', SORT_ASC);
		
		asort($result);
		echo json_encode($result);
	}
	
	// Auxiliary functions
	
	//private function check
	
	function array_orderby() {
		$args = func_get_args();
		$data = array_shift($args);
		foreach ($args as $n => $field) {
			if (is_string($field)) {
				$tmp = array();
				foreach ($data as $key => $row)
					$tmp[$key] = strtolower($row[$field]);
				$args[$n] = $tmp;
				}
		}
		$args[] = &$data;
		call_user_func_array('array_multisort', $args);
		return array_pop($args);
	}
	
?>