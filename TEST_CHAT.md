# CHAT SYSTEM TEST GUIDE

## Step 1: Start Server
```powershell
cd C:\Users\Laurentiu\aetherro
npm start
```

Wait for: `mp.events.delayInitialization = false` (all players can now join)

## Step 2: Connect Client & Login

1. Open RAGE:MP launcher
2. Connect to `127.0.0.1:22005`
3. Register new account OR login
4. After successful login, you should see player spawn

## Step 3: Test Chat

### Test 3.1: Basic Message
- Press **T** to open chat
- Type: `hello world`
- Press **Enter**

**Expected Results:**
- Message should appear in chat as: `YourUsername: hello world`
- No errors in F11 console
- Message visible to all players

### Test 3.2: Multiple Players
- Open second RAGE:MP instance
- Login with different account
- Player 1 sends: `player 1 message`
- Player 2 sends: `player 2 message`

**Expected Results:**
- Both messages visible to both players
- Messages show correct usernames

### Test 3.3: Commands
- Press **T** to open chat
- Type: `/help`
- Press **Enter**

**Expected Results:**
- System displays available commands
- No F11 errors

### Test 3.4: Spam Protection
- Send message quickly 5 times
- Should see: `[System] Please do not spam messages.` on 4th/5th

**Expected Results:**
- Anti-spam cooldown working (400ms between messages)

### Test 3.5: Caps Lock
- Press T to open chat
- Type: `hello` normally
- Press Shift+Caps to type: `HELLO`
- Send both

**Expected Results:**
- Both messages appear as typed
- Caps Lock works normally

## Server Console Output (F10)

Should see logs like:
```
[CHAT DEBUG] Received message from PlayerName: "hello world"
[CHAT DEBUG] Player logged in: true
```

## Client Console Output (F11)

Should see logs like:
```
[CHAT] Browser instance created and marked as chat
[CHAT] Browser settings applied
[CHAT DEBUG] Sending chat message: hello world
```

## Troubleshooting

### Problem: Chat window doesn't open
- Check if `T` key is mapped to chat in RAGE:MP
- Verify `mp.gui.chat.show(false)` is called
- Check browser creation succeeded in F10

### Problem: Messages don't appear
- Check F10 for `[CHAT DEBUG] Received message...`
- Check if player.getVariable('loggedIn') is true
- Verify database connection working

### Problem: F11 error "mp.events.callRemote is not a function"
- This means HTML is running OUTSIDE of RAGE:MP context
- Verify package path is `package://advchat/index.html` in conf.json

### Problem: Spam message appears for every message
- Check CHAT_COOLDOWN in chat.js (should be 400ms)
- Verify Date.now() timing is working

## Quick Debug Commands

In F10 console, try:
```javascript
// Show all players
mp.players.toArray().forEach(p => console.log(p.name, p.getVariable('loggedIn')))

// Check chat browser
mp.browsers.toArray().forEach(b => console.log("Browser:", b))

// Trigger test message
mp.players.local.call('chat:push', ['Test message from F10'])
```

---

**System Status: READY FOR TESTING**
Last Updated: 2025-12-12
