const conf = {
  serverURL: 'https://api.lims.cailab.org',
  authServerURL: 'https://api.auth.cailab.org',
};

if (process.env.NODE_ENV === 'development') {
  conf.serverURL = 'http://local.cailab.org:8000'
}

export default conf;
