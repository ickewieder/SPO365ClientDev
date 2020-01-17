export const environment = {
	production: false,
	config: {
		tenant: '50be5a17-87c8-4ad8-af8c-3cff728a41b3',
		clientId: 'cae4d5e6-e37a-4c90-854a-85a0b28b305f', //=> Application ID in Azure
		cacheLocation: 'localStorage',
		endpoints: {
			graphApiUri: 'https://graph.microsoft.com',
			sharePointUri: 'https://bdrslap.sharepoint.com' // Replace with your Tenant
		},
		returnUrl: 'http://localhost:4200'
	}
};
