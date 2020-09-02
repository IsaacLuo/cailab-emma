const conf = {
  serverURL: 'https://api.emma.cailab.org',
  authServerURL: 'https://api.auth.cailab.org',
  GUEST_ID: '000000000000000000000000',
};

if (process.env.NODE_ENV === 'development') {
  conf.serverURL = 'http://local.cailab.org:8000'
}

export default conf;
