<?php
	session_start();
	date_default_timezone_set('Europe/Copenhagen');

	$call 	= $_POST['call'];

	include("db-config.php");
	include("login.php");

	$mysqli = new mysqli($GLOBALS["db_server"], $GLOBALS["db_user"], $GLOBALS["db_password"], $GLOBALS["db_name"]);

    if (mysqli_connect_errno()) {
		 echo "<br />";
		 printf("Connect failed: %s\n", mysqli_connect_error());
		 exit();
	 }

	$mysqli->set_charset("utf8");

	switch($call) {
		case "login"								:	login($mysqli);								break;

		case "getWordEntry"						:	getWordEntry($mysqli); 						break;
		case "getLatestWordsAdded"				:	getLatestWordsAdded($mysqli);				break;
		case "getLexiconList"					:	getLexiconList($mysqli); 					break;
		case "getWordlistLocalSorted"			:	getWordlistSorted($mysqli, true);		break;
		case "getWordlistForeignSorted"		:	getWordlistSorted($mysqli, false);		break;

		case "saveNewWord"						:	saveNewWord($mysqli);						break;
	}

	function getWordlistSorted($mysqli, $isToLocal) {
		/*
		$conlangName = "CONLANG";
		$conlangPrefix = "Pre";
		$conlangSuffix = "Suf";
		*/

		$lookup = "";
		$lookupSql = "";
		if (isset($_POST['lookup'])) {
			$lookup = $_POST['lookup'];
		}
		if ($lookup !== "") {
			if ($isToLocal) {
				$lookupSql = "WHERE definition = '$lookup'";
			}
			else {
				$lookupSql = "WHERE word = '$lookup'";
			}
		}
		else {
			//$lookupSql = "WHERE definition = 'have'"; // TEST ONLY
		}

		if (isset($_SESSION["selectedLang"])) {
			$selectedLanguage = $_SESSION["selectedLang"];
		}
		else {
			$selectedLanguage = "cantade"; // TODO: Change this to first language
		}

		$stmtConlang = $mysqli->prepare("
			SELECT
				lang_id, lang_prefix, lang_name, lang_suffix, lang_target_lang, lang_internal_name
			FROM
				lexicon_langs
			WHERE
				lang_internal_name = ?
			LIMIT
				1
		");

		$stmtConlang->bind_param('s', $selectedLanguage);
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
				etymology, irregular, word_usage, note, new, examples
			FROM
				$table
			$lookupSql
			ORDER BY
				definition, class, word ASC
		");

		/*
			REMOVED FROM QUERY:
			verb_conjugation, pronoun_subclass

			$verbConjugation, $pronounSubclass,
		*/

		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($id, $lex, $lexClarification, $class, $definitionAsIs, $definitionClarification, $pronounciation, $etymology, $irregular, $usage, $note, $new, $examples);

		$result = array();
		$lexemes = array();

		// If potential new word is set
		if (isset($_POST['newword'])) {
			$newWord = $_POST['newword'];
			if ($newWord != null) {
				$newWordJson = $newWord;
				$lexemes[] = $newWordJson;
			}
		}

		while($row = $stmt->fetch()) {
			/*	Splitting up definitions
			**	Definitions can be appear as "word1, word2, word2" in the database
			*/
			$definitionsArray = explode(",", $definitionAsIs);
			$definitionsArray = array_map('trim',$definitionsArray); // remove spaces
			sort($definitionsArray);

			foreach($definitionsArray as $definition) {
				$definition = trim($definition);
				$lexemeOutput		= $lex;
				$nativeOrthography = $lex; // TODO: use override field instead
				// base output on direction
				if ($isToLocal) {
					$lexemeOutput		= $lex;
					$definitionOutput = $definition;
				}
				else {
					$lexemeOutput 		= $definition;
					$definitionOutput = $lex;
				}

				// Check if identical definition is already found
				$key = array_search($definitionOutput, array_column($lexemes, "lexeme"));

				// TODO: New key finding implementation
				//$keys = array_keys($definitionsArray, array_column($lexemes, "lexeme"));

				if ($irregular == 1) {
					$irregular = true;
				} else {
					$irregular = false;
				}

				// If key is not found, create new entry
				if ($key === false) {
					$lexemes[] = array(
						"lexeme" 				=> trim($definitionOutput),
						//"lexClass" 				=> $class,
						"definitions"			=> array(
							"0"						=> array(
								"lexId"					=> $id,
								"lexeme" 				=> $lexemeOutput,
								"lexClass" 				=> $class,
								"ipa" 					=> $pronounciation,
								"usage" 					=> $usage,
								"example" 				=> $examples,
								"etymology"				=> $etymology,
								"irregular"				=> $irregular,
								"nativeOrthography"	=> $nativeOrthography
							)
						)
					);
				}
				// If key is found
				else {
					// Push to array
					//if ($lexemes[$key]["lexClass"] == $class) {
						array_push($lexemes[$key]["definitions"],
							array(
									"lexId"					=> $id,
									"lexeme" 				=> $lexemeOutput,
									"lexClass" 				=> $class,
									"ipa" 					=> $pronounciation,
									"usage" 					=> $usage,
									"example" 				=> $examples,
									"etymology"				=> $etymology,
									"irregular"				=> $irregular,
									"nativeOrthography"	=> $nativeOrthography
								)
						);
					//}
					/*
					else {
						// New entry
						$lexemes[] = array(
							"lexeme" 				=> trim($definitionOutput),
							"lexClass" 				=> $class,
							"definitions"			=> array(
								"0"						=> array(
									"lexeme" 				=> $lexemeOutput,
									"ipa" 					=> $pronounciation,
									"usage" 					=> $usage,
									"example" 				=> $examples,
									"etymology"				=> $etymology,
									"irregular"				=> $irregular
								)
							)
						);
					}
					*/
				}
			}
		}

		// Sort the multidimensional array
	  $lexemes = array_orderby($lexemes, 'lexeme');
	  //$lexemes = array_orderby($lexemes, 'lexeme', SORT_ASC, 'lexClass', SORT_ASC);

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

	function getLexiconList($mysqli) {
		$lexiconList = array();

		$stmt = $mysqli->prepare("
	 	  SELECT
	 		  lang_prefix, lang_name, lang_suffix, lang_target_lang, lang_internal_name
	 	  FROM
	 		  lexicon_langs
	   ");

	   $stmt->execute();
	   $stmt->store_result();
	   $stmt->bind_result($prefix, $lexiconName, $suffix, $targetLang, $internalName);

	   while($row = $stmt->fetch()) {
			$lexiconList[] = array(
				"lexiconName" 	=> $lexiconName,
				"namePrefix"	=> $prefix,
				"nameSuffix"	=> $suffix,
				"targetLang"	=>	$targetLang,
				"internalName"	=> $internalName
			);
	 	}

		echo json_encode($lexiconList);
	}

	function getWordEntry($mysqli) {
		$stmt = $mysqli->prepare("
			SELECT
				id, word, word_clarification, class, definition, definition_clarification, pronounciation,
				etymology_new, irregular, verb_conjugation, pronoun_subclass, word_usage, note, new, examples
			FROM
				cantade
			WHERE
				id = 1
			ORDER BY
				definition, class, word ASC
			LIMIT 1
		");

		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($id, $lex, $lexClarification, $class, $definitionAsIs, $definitionClarification, $pronounciation, $etymology, $irregular, $verbConjugation, $pronounSubclass, $usage, $note, $new, $examples);

		while($row = $stmt->fetch()) {
			echo getWordEntryEtymology($etymology);
		}
	}

	function getWordEntryEtymology($string) {
		$result = $string;

		return $result;
	}

	function getLatestWordsAdded($mysqli) {
		$lexemes = array();
		// TODO change hardcoded language selection
		$stmt = $mysqli->prepare("
			SELECT
				id, word, word_clarification, class, definition, definition_clarification, pronounciation,
				etymology_new, irregular, verb_conjugation, pronoun_subclass, word_usage, note, new, examples, time_added
			FROM
				cantade
			ORDER BY
				time_added ASC
			LIMIT 10
		");

		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($id, $lex, $lexClarification, $class, $definitionAsIs, $definitionClarification, $pronounciation, $etymology, $irregular, $verbConjugation, $pronounSubclass, $usage, $note, $new, $examples, $timeAdded);

		while($row = $stmt->fetch()) {
			echo "$lex<br />"; // TODO change to JSON
		}
		//echo json_encode($lexemes, JSON_FORCE_OBJECT);
	}

	function saveNewWord($mysqli) {

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
