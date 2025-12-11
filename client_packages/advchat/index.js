if(mp.storage.data.timeStamp === undefined)
    mp.storage.data.timeStamp = false;
if(mp.storage.data.pageSize === undefined)
    mp.storage.data.pageSize = 18;
if(mp.storage.data.fontSize === undefined)
    mp.storage.data.fontSize = 0.9;
if(mp.storage.data.toggleChat === undefined)
    mp.storage.data.toggleChat = true;

// Mark chat as active
mp.gui.chat.show(false);
const chat = mp.browsers.new('package://advchat/index.html');
chat.markAsChat();

// Set Data
chat.execute(`setToggleTimestamp(${mp.storage.data.timeStamp});`);
chat.execute(`setPageSize(${mp.storage.data.pageSize});`);
chat.execute(`setFontSize(${mp.storage.data.fontSize});`);
chat.execute(`setToggleChat(${mp.storage.data.toggleChat});`);


// Chat commands are handled via mp.gui.chat (native RAGE:MP chat)
// Additional commands for chat customization
if (typeof mp !== 'undefined' && mp.gui && mp.gui.chat) {
    try {
        // Commands registration - handled via chat browser JavaScript directly
        // No need for mp.events.addCommand as chat UI is CEF browser based
        console.log("[CHAT] Chat system initialized successfully");
    } catch(e) {
        console.error("[CHAT] Error initializing chat:", e);
    }
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
    chat.execute(`chatAPI.push('${message.replace(/'/g, "\\'")}');`);
});

// Clear chat event, call from server
mp.events.add("chat:clear", () =>
{
    chat.execute(`chatAPI.clear();`);
});

// Chat activation/deactivation
mp.events.add("chat:activate", (toggle) =>
{
    chat.execute(`chatAPI.activate(${toggle});`);
});

// Chat show/hide
mp.events.add("chat:show", (toggle) =>
{
    chat.execute(`chatAPI.show(${toggle});`);
});