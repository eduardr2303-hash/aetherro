/**
 * RAGE:MP Advanced Chat System
 * Server-side chat handler with message validation and broadcasting
 */

const MAX_MESSAGE_LENGTH = 255;
const CHAT_COOLDOWN = 400; // milliseconds

// Store player chat cooldown timestamps
const playerChatCooldown = new Map();

/**
 * Handle incoming chat messages from clients
 * Validates message and broadcasts to all players
 */
mp.events.add('server:chatMessage', (player, message) => {
    // Check if player is logged in
    if (!player.getVariable('loggedIn')) {
        player.outputChatBox('[System] You must be logged in to use chat.');
        return;
    }

    // Validate message
    if (!message || message.trim().length === 0) {
        return;
    }

    // Check message length
    if (message.length > MAX_MESSAGE_LENGTH) {
        player.outputChatBox(`[System] Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`);
        return;
    }

    // Check cooldown
    const now = Date.now();
    const lastMessage = playerChatCooldown.get(player.id) || 0;
    
    if (now - lastMessage < CHAT_COOLDOWN) {
        player.outputChatBox('[System] Please do not spam messages.');
        return;
    }

    // Update cooldown
    playerChatCooldown.set(player.id, now);

    // Remove color codes for security (optional)
    const cleanMessage = message.replace(/!{.*?}/g, '');

    // Get player name/username
    const username = player.getVariable('username') || 'Unknown';
    const displayName = player.name || username;

    // Format and broadcast message
    const formattedMessage = `${displayName}: ${cleanMessage}`;
    
    // Broadcast to all players
    mp.players.forEach(p => {
        p.outputChatBox(formattedMessage);
    });

    // Log to console
    console.log(`[CHAT] ${displayName}: ${cleanMessage}`);
});

/**
 * Handle custom server chat announcements
 * Can be called from other parts of the server
 */
mp.events.add('server:sendSystemMessage', (message) => {
    if (!message || message.length === 0) return;

    const systemMessage = `[System] ${message}`;
    
    mp.players.forEach(p => {
        p.outputChatBox(systemMessage);
    });

    console.log(systemMessage);
});

/**
 * Clear chat for specific player or all players
 */
mp.events.add('server:clearPlayerChat', (player) => {
    if (player && player.call) {
        player.call('chat:clear');
    }
});

/**
 * Clear chat for all players
 */
mp.events.add('server:clearAllChat', () => {
    mp.players.forEach(p => {
        p.call('chat:clear');
    });
});

/**
 * Player join announcement
 */
mp.events.add('playerJoin', (player) => {
    // Don't announce until player is logged in
    // Announcement will be sent after successful login
});

/**
 * Player logged in announcement
 * Should be called after successful authentication
 */
mp.events.add('server:playerLoggedIn', (player) => {
    const username = player.getVariable('username');
    const message = `${username} has joined the server.`;
    
    mp.players.forEach(p => {
        p.outputChatBox(`[Server] ${message}`);
    });

    console.log(`[SERVER] ${message}`);
});

/**
 * Player quit - announcement
 */
mp.events.add('playerQuit', (player) => {
    if (!player.getVariable('loggedIn')) return;

    const username = player.getVariable('username');
    const message = `${username} has left the server.`;
    
    mp.players.forEach(p => {
        p.outputChatBox(`[Server] ${message}`);
    });

    // Clean up cooldown
    playerChatCooldown.delete(player.id);
    
    console.log(`[SERVER] ${message}`);
});

/**
 * Handle incoming chat commands from clients
 */
mp.events.add('server:command', (player, command) => {
    // Check if player is logged in
    if (!player.getVariable('loggedIn')) {
        player.outputChatBox('[System] You must be logged in to use commands.');
        return;
    }

    if (!command || command.trim().length === 0) {
        return;
    }

    // Parse command and arguments
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();

    // Available commands
    switch (cmd) {
        case 'help':
            showHelpCommand(player);
            break;
        case 'pm':
        case 'msg':
            handlePrivateMessage(player, args);
            break;
        case 'players':
            showPlayersCommand(player);
            break;
        case 'clear':
            player.call('chat:clear');
            break;
        default:
            player.outputChatBox(`[System] Unknown command: /${cmd}. Type /help for available commands.`);
    }
});

/**
 * Show help for available commands
 */
function showHelpCommand(player) {
    player.outputChatBox('[System] Available commands:');
    player.outputChatBox('[System] /help - Show this message');
    player.outputChatBox('[System] /players - List all online players');
    player.outputChatBox('[System] /pm <player_id> <message> - Send private message');
    player.outputChatBox('[System] /clear - Clear chat');
}

/**
 * Handle private messages between players
 */
function handlePrivateMessage(player, args) {
    if (args.length < 3) {
        player.outputChatBox('[System] Usage: /pm <player_id> <message>');
        return;
    }

    const targetId = parseInt(args[1]);
    const targetPlayer = mp.players.at(targetId);

    if (!targetPlayer) {
        player.outputChatBox('[System] Player not found.');
        return;
    }

    if (targetId === player.id) {
        player.outputChatBox('[System] You cannot send messages to yourself.');
        return;
    }

    const message = args.slice(2).join(' ');
    const senderName = player.getVariable('username') || 'Unknown';
    const receiverName = targetPlayer.getVariable('username') || 'Unknown';

    targetPlayer.outputChatBox(`[Private from ${senderName}] ${message}`);
    player.outputChatBox(`[Private to ${receiverName}] ${message}`);

    console.log(`[PM] ${senderName} -> ${receiverName}: ${message}`);
}

/**
 * Show list of online players
 */
function showPlayersCommand(player) {
    const playerCount = mp.players.length;
    player.outputChatBox(`[System] Online players (${playerCount}):`);

    mp.players.forEach(p => {
        const username = p.getVariable('username') || 'Unknown';
        player.outputChatBox(`  [${p.id}] ${username}`);
    });
}

module.exports = {
    // Export for potential external use
};

