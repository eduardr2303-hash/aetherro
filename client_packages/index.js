require('./login.js');
require('./advchat/index.js');

mp.events.add('playerReady', () => {
    mp.events.call('client:showLoginScreen');
});