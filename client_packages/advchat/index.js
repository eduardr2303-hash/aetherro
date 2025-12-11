if (typeof mp === 'undefined') {
    console.error("[CHAT] mp is not defined - Chat system cannot initialize");
    process.exit(1);
}

if(mp.storage.data.timeStamp === undefined)
    mp.storage.data.timeStamp = false;
if(mp.storage.data.pageSize === undefined)
    mp.storage.data.pageSize = 18;
if(mp.storage.data.fontSize === undefined)
    mp.storage.data.fontSize = 0.9;
if(mp.storage.data.toggleChat === undefined)
    mp.storage.data.toggleChat = true;

console.log("[CHAT] Initializing chat system...");

// Hide native chat and create custom browser
mp.gui.chat.show(false);

try {
    const chat = mp.browsers.new('package://advchat/index.html');
    if (!chat) {
        console.error("[CHAT] Failed to create browser instance");
        throw new Error("Browser creation failed");
    }
    
    chat.markAsChat();
    console.log("[CHAT] Browser instance created and marked as chat");
    
    // Set Data
    chat.execute(`setToggleTimestamp(${mp.storage.data.timeStamp});`);
    chat.execute(`setPageSize(${mp.storage.data.pageSize});`);
    chat.execute(`setFontSize(${mp.storage.data.fontSize});`);
    chat.execute(`setToggleChat(${mp.storage.data.toggleChat});`);
    console.log("[CHAT] Browser settings applied");
} catch(e) {
    console.error("[CHAT] Error creating browser:", e);
}

// Storage for global chat reference
if (!global.chatBrowser) {
    global.chatBrowser = null;
}

function getChatBrowser() {
    if (!global.chatBrowser) {
        try {
            global.chatBrowser = mp.browsers.new('package://advchat/index.html');
            global.chatBrowser.markAsChat();
        } catch(e) {
            console.error("[CHAT] Error getting/creating chat browser:", e);
            return null;
        }
    }
    return global.chatBrowser;
}


// Anti spam
mp.players.local.lastMessage = new Date().getTime();
mp.events.add("setLastMessage", (ms) =>
{
    mp.players.local.lastMessage = ms + 350;
});

// Chat message receive from server
mp.events.add("chat:push", (message) =>
{
    const chatBrowser = getChatBrowser();
    if (chatBrowser) {
        try {
            chatBrowser.execute(`chatAPI.push('${message.replace(/'/g, "\\'")}');`);
        } catch(e) {
            console.error("[CHAT] Error pushing message:", e);
        }
    }
});

// Clear chat event, call from server
mp.events.add("chat:clear", () =>
{
    const chatBrowser = getChatBrowser();
    if (chatBrowser) {
        try {
            chatBrowser.execute(`chatAPI.clear();`);
        } catch(e) {
            console.error("[CHAT] Error clearing chat:", e);
        }
    }
});

// Chat activation/deactivation
mp.events.add("chat:activate", (toggle) =>
{
    const chatBrowser = getChatBrowser();
    if (chatBrowser) {
        try {
            chatBrowser.execute(`chatAPI.activate(${toggle});`);
        } catch(e) {
            console.error("[CHAT] Error activating chat:", e);
        }
    }
});

// Chat show/hide
mp.events.add("chat:show", (toggle) =>
{
    const chatBrowser = getChatBrowser();
    if (chatBrowser) {
        try {
            chatBrowser.execute(`chatAPI.show(${toggle});`);
        } catch(e) {
            console.error("[CHAT] Error showing chat:", e);
        }
    }
});