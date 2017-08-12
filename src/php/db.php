<?php
	session_start();
	date_default_timezone_set('Europe/Copenhagen');

	$call 	= $_POST['call'];

	include("db-config.php");

	$mysqli = new mysqli($GLOBALS["db_server"], $GLOBALS["db_user"], $GLOBALS["db_password"], $GLOBALS["db_name"]);

    if (mysqli_connect_errno()) {
		 echo "<br />";
		 printf("Connect failed: %s\n", mysqli_connect_error());
		 exit();
	 }

	$mysqli->set_charset("utf8");

	switch($call) {
		case "getWordlistCantadeSorted"		:	getWordlistCantadeSorted($mysqli);	break;
		case "getWordlistEnglishSorted"		:	getWordlistEnglishSorted($mysqli);	break;
	}

	// TEST OVERRIDE
		$lexemes2 = null;
		$lexemes2[0] = array(
			"lexeme" 				=> "wordEng",
			"lexClass" 				=> "verb",
			"definitions"			=> array(
				"0"					=> array(
					"lexeme" 				=> "wordCon",
					"ipa" 					=> "pronounciation",
					"usage" 					=> "it is used, yes",
					"example" 				=> "Homonymous entry",
					"etymology"				=> "very much ancient"
				)
			)
		);

	function getWordlistEnglishSorted($mysqli) {
		$conlangName = "CONLANG";
		$conlangPrefix = "Pre";
		$conlangSuffix = "Suf";

		$stmtConlang = $mysqli->prepare("
			SELECT
				lang_id, lang_prefix, lang_name, lang_suffix, lang_target_lang, lang_internal_name
			FROM
				lexicon_langs
			LIMIT
				1
		");

		/*
		WHERE
			lang_internal_name = 'proto-cantade'
			*/

		$stmtConlang->execute();
		$stmtConlang->store_result();
		$stmtConlang->bind_result($id, $prefix, $conlang, $suffix, $targetLang, $internalName);

		while($row = $stmtConlang->fetch()) {
			$conlangName 	= $conlang;
			$conlangPrefix = $prefix;
			$conlangSuffix = $suffix;
			$targetLang		= $targetLang;
			$table 			= $internalName;
		}

		$stmt = $mysqli->prepare("
			SELECT
				id, word, word_clarification, class, definition, definition_clarification, pronounciation,
				etymology, irregular, verb_conjugation, pronoun_subclass, word_usage, note, new
			FROM
				$table
			ORDER BY
				definition, word ASC
		");

		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($id, $lex, $lexClarification, $class, $definitionAsIs, $definitionClarification, $pronounciation, $etymology, $irregular, $verbConjugation, $pronounSubclass, $usage, $note, $new);

		$result = array();
		$lexemes = array();

		while($row = $stmt->fetch()) {
			/*	Splitting up definitions
			**	Definitions can be appear as "word1, word2, word2" in the database
			*/
			$definitionsArray = explode(",", $definitionAsIs);
			foreach($definitionsArray as $definition) {
				// Check if identical definition is already found
				$key = array_search($definition, array_column($lexemes, 'lexeme'));

				// If key is not found, create new entry
				if ($key === false) {
					$lexemes[] = array(
						"lexeme" 				=> trim($definition),
						"lexClass" 				=> $class,
						"definitions"			=> array(
							"0"						=> array(
								"lexeme" 				=> $lex,
								"ipa" 					=> $pronounciation,
								"usage" 					=> $usage,
								"example" 				=> "",
								"etymology"				=> $etymology
							)
						)
					);
				}
				else {
					// Push to array
					if ($lexemes[$key]["lexClass"] == $class) {
						array_push($lexemes[$key]["definitions"],
							array(
									"lexeme" 			=> $lex,
									"ipa" 				=> $pronounciation,
									"usage" 				=> $usage,
									"example" 			=> "",
									"etymology"			=> $etymology
								)
						);
					}
					else {
						// New entry
						$lexemes[] = array(
							"lexeme" 				=> trim($definition),
							"lexClass" 				=> $class,
							"definitions"			=> array(
								"0"						=> array(
									"lexeme" 				=> $lex,
									"ipa" 					=> $pronounciation,
									"usage" 					=> $usage,
									"example" 				=> "",
									"etymology"				=> $etymology
								)
							)
						);
					}
				}
			}
		}

		// Sort the multidimensional array
	  $lexemes = array_orderby($lexemes, 'lexeme', SORT_ASC, 'lexClass', SORT_ASC);

		// Create JSON
		$result = array(
				"conlang" => $conlangName,
				"conlangPrefix" => $conlangPrefix,
				"conlangSuffix" => $conlangSuffix,
				"targetLang" => $targetLang,
				"lexemes" => $lexemes
			);

		echo json_encode($result, JSON_FORCE_OBJECT);
	}

	function custom_sort($a,$b) {
          return $a['lexeme']>$b['lexeme'];
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

	function make_comparer() {
		// Normalize criteria up front so that the comparer finds everything tidy
		$criteria = func_get_args();
			foreach ($criteria as $index => $criterion) {
					$criteria[$index] = is_array($criterion)
					? array_pad($criterion, 3, null)
					: array($criterion, SORT_ASC, null);
				}

			return function($first, $second) use (&$criteria) {
				foreach ($criteria as $criterion) {
					// How will we compare this round?
					list($column, $sortOrder, $projection) = $criterion;
					$sortOrder = $sortOrder === SORT_DESC ? -1 : 1;

					// If a projection was defined project the values now
					if ($projection) {
						$lhs = call_user_func($projection, $first[$column]);
						$rhs = call_user_func($projection, $second[$column]);
					}
					else {
						$lhs = $first[$column];
						$rhs = $second[$column];
					}

					// Do the actual comparison; do not return if equal
					if ($lhs < $rhs) {
						return -1 * $sortOrder;
					}
					else if ($lhs > $rhs) {
						return 1 * $sortOrder;
					}
				}

			return 0; // tiebreakers exhausted, so $first == $second
		};
	}

	function method1($a,$b) {
		return ($a[2]["lexemes"]["lexeme"] <= $b[2]["lexemes"]["lexeme"]) ? -1 : 1;
	}
?>
