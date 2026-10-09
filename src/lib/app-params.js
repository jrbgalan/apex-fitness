const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	if (!isNode) {
		window.localStorage.removeItem('token');
		window.localStorage.removeItem('apex_token');
	}
};

const getStoredAccessToken = () => {
	if (isNode) return null;
	return window.localStorage.getItem('token') || window.localStorage.getItem('apex_token');
};

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		appId: 'apex-fitness-gym',
		token: getStoredAccessToken(),
		functionsVersion: '1.0.0',
		appBaseUrl: !isNode ? window.location.origin : '',
	};
};

export const appParams = {
	...getAppParams(),
};
