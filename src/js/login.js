function login() {
   $.post( connection, {
		call: 'login',
      email: 'henrik@stavnem.net',
      password: '1234'
	} )
    .done(
		function( data, wordlist ) {
			console.log(data);
		}
	);
}
