/**
 * RAGE:MP Advanced Chat System
 * Server-side chat handler with message validation and broadcasting
 */

const MAX_MESSAGE_LENGTH = 255;
const CHAT_COOLDOWN = 400; // milliseconds

// Store player chat cooldown timestamps
const playerChatCooldown = new Map();

/**
 * Sanitize message to prevent injection attacks
 */
function sanitizeMessage(message) {
    if (!message || typeof message !== 'string') return '';
    return message
        .replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;')
        .replace(/!{.*?}/g, '') // Remove color codes
        .trim();
}

/**
 * Handle incoming chat messages from clients
 * Validates message and broadcasts to all players
 */
mp.events.add('server:chatMessage', (player, message) => {
    console.log(`[CHAT] ===== MESSAGE RECEIVED =====`);
    console.log(`[CHAT] From: ${player.name} (ID: ${player.id})`);
    console.log(`[CHAT] Message: "${message}"`);
    console.log(`[CHAT] Logged in: ${player.getVariable('loggedIn')}`);
    
    // Check if player is logged in
    if (!player.getVariable('loggedIn')) {
        console.log(`[CHAT] ❌ NOT LOGGED IN - rejecting message`);
        player.call('chat:push', ['[System] You must be logged in to use chat.']);
        return;
    }

    // Validate message
    if (!message || message.trim().length === 0) {
        console.log(`[CHAT] ❌ EMPTY MESSAGE - rejecting`);
        return;
    }

    // Check message length
    if (message.length > MAX_MESSAGE_LENGTH) {
        console.log(`[CHAT] ❌ MESSAGE TOO LONG: ${message.length}/${MAX_MESSAGE_LENGTH}`);
        player.call('chat:push', [`[System] Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`]);
        return;
    }

    // Check cooldown
    const now = Date.now();
    const lastMessage = playerChatCooldown.get(player.id) || 0;
    const timeSinceLastMessage = now - lastMessage;
    
    console.log(`[CHAT] Cooldown check: ${timeSinceLastMessage}ms / ${CHAT_COOLDOWN}ms`);
    
    if (timeSinceLastMessage < CHAT_COOLDOWN) {
        console.log(`[CHAT] ❌ SPAM DETECTED`);
        player.call('chat:push', ['[System] Please do not spam messages.']);
        return;
    }

    // Update cooldown
    playerChatCooldown.set(player.id, now);
    console.log(`[CHAT] ✓ Cooldown updated`);

    // Sanitize message for security
    const cleanMessage = sanitizeMessage(message);

    // Validate cleaned message
    if (cleanMessage.length === 0) {
        return;
    }

    // Get player name/username
    const username = player.getVariable('username') || 'Unknown';
    const displayName = player.name || username;

    // Format and broadcast message
    const formattedMessage = `${displayName}: ${cleanMessage}`;
    
    console.log(`[CHAT] Formatted message: "${formattedMessage}"`);
    console.log(`[CHAT] Broadcasting to ${mp.players.length} players...`);
    
    // Broadcast to all players
    let sentCount = 0;
    mp.players.forEach(p => {
        try {
            p.call('chat:push', [formattedMessage]);
            sentCount++;
        } catch(e) {
            console.error(`[CHAT] Error sending to ${p.name}:`, e);
        }
    });

    // Log to console
    console.log(`[CHAT] ✓ Broadcast complete - sent to ${sentCount} players`);
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
        p.call('chat:push', [systemMessage]);
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
    console.log(`[CHAT] Player logged in event - Player: ${player.name} (ID: ${player.id})`);
    
    const username = player.getVariable('username');
    const message = `${username} has joined the server.`;
    
    console.log(`[CHAT] Sending join announcement to all players: "${message}"`);
    
    let sentCount = 0;
    mp.players.forEach(p => {
        try {
            p.call('chat:push', [`[Server] ${message}`]);
            sentCount++;
        } catch(e) {
            console.error(`[CHAT] Error announcing to ${p.name}:`, e);
        }
    });

    console.log(`[CHAT] ✓ Join announcement sent to ${sentCount} players`);
});

/**
 * Player quit - announcement
 */
mp.events.add('playerQuit', (player) => {
    if (!player.getVariable('loggedIn')) return;

    const username = player.getVariable('username');
    const message = `${username} has left the server.`;
    
    mp.players.forEach(p => {
        p.call('chat:push', [`[Server] ${message}`]);
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
        player.call('chat:push', ['[System] You must be logged in to use commands.']);
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
            player.call('chat:push', [`[System] Unknown command: /${cmd}. Type /help for available commands.`]);
    }
});

/**
 * Show help for available commands
 */
function showHelpCommand(player) {
    player.call('chat:push', ['[System] Available commands:']);
    player.call('chat:push', ['[System] /help - Show this message']);
    player.call('chat:push', ['[System] /players - List all online players']);
    player.call('chat:push', ['[System] /pm <player_id> <message> - Send private message']);
    player.call('chat:push', ['[System] /clear - Clear chat']);
}

/**
 * Handle private messages between players
 */
function handlePrivateMessage(player, args) {
    if (args.length < 3) {
        player.call('chat:push', ['[System] Usage: /pm <player_id> <message>']);
        return;
    }

    const targetId = parseInt(args[1]);
    let targetPlayer = null;
    
    // Find player by ID
    mp.players.forEach(p => {
        if (p.id === targetId) {
            targetPlayer = p;
        }
    });

    if (!targetPlayer) {
        player.call('chat:push', ['[System] Player not found.']);
        return;
    }

    if (targetId === player.id) {
        player.call('chat:push', ['[System] You cannot send messages to yourself.']);
        return;
    }

    const message = args.slice(2).join(' ');
    const senderName = player.getVariable('username') || 'Unknown';
    const receiverName = targetPlayer.getVariable('username') || 'Unknown';

    targetPlayer.call('chat:push', [`[Private from ${senderName}] ${message}`]);
    player.call('chat:push', [`[Private to ${receiverName}] ${message}`]);

    console.log(`[PM] ${senderName} -> ${receiverName}: ${message}`);
}

/**
 * Show list of online players
 */
function showPlayersCommand(player) {
    const playerCount = mp.players.length;
    player.call('chat:push', [`[System] Online players (${playerCount}):`]);

    mp.players.forEach(p => {
        const username = p.getVariable('username') || 'Unknown';
        player.call('chat:push', [`  [${p.id}] ${username}`]);
    });
}

module.exports = {
    // Export for potential external use
};

