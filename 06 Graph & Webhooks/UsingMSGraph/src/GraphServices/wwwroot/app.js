var cfg = {
	tenant: '50be5a17-87c8-4ad8-af8c-3cff728a41b3',
	clientId: 'cae4d5e6-e37a-4c90-854a-85a0b28b305f', //=> Application ID in Azure
	cacheLocation: 'localStorage',
	endpoints: {
		graphApiUri: 'https://graph.microsoft.com',
		sharePointUri: 'https://bdrslap.sharepoint.com' // Replace with your Tenant
	},
	returnUrl: 'https://sp2019:5001'
};

var gc;

$(document).ready(function() {
	gc = new GraphClient(cfg);
});

function doRead() {
	gc.signIn();

	gc.query('/v1.0/me/drive/recent', cfg.endpoints.graphApiUri, (response) => {
		var items = response.value.slice(0, 9);
		console.log('Successfully fetched Recent Top Ten Documents:', items);
		$('#OneDrive').empty();
		items.forEach((item) => {
			$('#OneDrive').append(
				`<li>${moment(item.remoteItem.lastModifiedDateTime).format('MMM Do YY')}, ${item.remoteItem.name}</li>`
			);
		});
	});

	gc.query('/v1.0/me/calendar/events', cfg.endpoints.graphApiUri, (response) => {
		var items = response.value;
		console.log('Successfully fetched Events:', items);
		$('#Events').empty();
		var html = `<table border="1"><tr><th>StartTime</th><th>Titel</th></tr>`;
		items.forEach((item) => {
			html += `<li><td>${moment(item.start.dateTime).format('MMM Do YY')}</td><td> ${item.subject}<td></tr>`;
		});
		$('#Events').append(html);
	});

	gc.query('/v1.0/me/contacts', cfg.endpoints.graphApiUri, (response) => {
		var items = response.value;
		console.log('Successfully fetched Contacts:', items);
		$('#Contacts').empty();
		items.forEach((item) => $('#Contacts').append(`<li>${item.displayName}</li>`));
	});

	gc.query('/_api/web/lists', cfg.endpoints.sharePointUri, (response) => {
		console.log('Successfully fetched list from SharePoint.');
		var items = response.value;
		$('#SharePoint').empty();
		items.forEach((item) => $('#SharePoint').append(`<li>${item.Title}</li>`));
	});
}
function createContact() {
	$('#NewContact').append(`<input id='personName'></input>`);
	$('#NewContact').append(`<button onclick='createReal()'>Erstelle</button>`);
}

function createReal() {
	// hier wird trozdem noch statsisch zugrgriffen
	var cont = {
		givenName: 'Pavel',
		surname: 'Bansky X',
		emailAddresses: [
			{
				address: 'pavelb@fabrikam.onmicrosoft.com',
				name: 'Pavel Bansky'
			}
		],
		businessPhones: [ '+1 732 555 0102' ]
	};
	$('#pResult').empty();
	gc.signIn();
	gc.create('/v1.0/me/contacts', cont);
}
function createSingleEvent() {
	var evt = {
		Subject: 'A Graph Event',
		Body: {
			ContentType: 'HTML',
			Content: 'The Super Fancy MS Graph Event'
		},
		Start: {
			DateTime: '2018-10-13T00:00:00',
			TimeZone: 'UTC'
		},
		End: {
			DateTime: '2018-10-14T00:00:00',
			TimeZone: 'UTC'
		}
	};

	$('#pResult').empty();
	gc.signIn();
	gc.create('/v1.0/me/calendar/events', evt);
}

class GraphClient {
	constructor(config) {
		this.authContext = null;
		this.adalConfig = config;
		this.initContex();
	}

	initContex() {
		this.authContext = new AuthenticationContext(this.adalConfig);
		var isCallback = this.authContext.isCallback(window.location.hash);
		this.authContext.handleWindowCallback();

		if (isCallback && !this.authContext.getLoginError()) {
			window.location = this.authContext._getItem(this.authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
		}
	}

	signIn() {
		var user = this.authContext.getCachedUser();
		if (!user) {
			this.authContext.login();
		}
	}

	signOut() {
		this.authContext.logOut();
		window.location.href = cfg.returnUrl;
	}

	query(qry, endpoint, callback) {
		var ctx;
		if (this.authContext !== null) {
			ctx = this.authContext;

			ctx.acquireToken(endpoint, function(error, token) {
				if (error || !token) {
					console.log('ADAL error occurred: ', error);
					return;
				} else {
					var uri = endpoint + qry;

					$.ajax({
						type: 'GET',
						url: uri,
						headers: {
							Authorization: 'Bearer ' + token,
							Accept: 'application/json'
						}
					})
						.done(callback)
						.fail((err) => {
							console.log('Fetching data failed.', err);
						});
				}
			});
		}
	}

	create(collection, item) {
		if (this.authContext !== null) {
			this.authContext.acquireToken(cfg.endpoints.graphApiUri, function(error, token) {
				if (error || !token) {
					console.log('ADAL error occurred: ', error);
					return;
				} else {
					var uri = cfg.endpoints.graphApiUri + collection;

					$.ajax({
						type: 'POST',
						data: JSON.stringify(item),
						url: uri,
						headers: {
							'Content-type': 'application/json',
							Authorization: 'Bearer ' + token
						}
					})
						.done(function(response) {
							console.log('success creating', response);
						})
						.fail(function(err) {
							console.log('error creating', err);
						});
				}
			});
		}
	}
}
