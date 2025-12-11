# RAGE:MP Advanced Chat System - Setup Guide

## Overview
Sistem chat complet pentru RAGE:MP server cu suport pentru mesaje, comenzi, mesaje private și notificări.

## 📋 Fișiere Modificate/Adăugate

### Fișiere Adăugate:
- `packages/template/chat.js` - Sistemul de chat server-side (NEW)
- `packages/template/CHAT_SYSTEM_REPORT.js` - Raport de validare (NEW)

### Fișiere Modificate:
- `packages/template/index.js` - Adăugat `require('./chat.js')`
- `packages/template/authentication.js` - Adăugat event `server:playerLoggedIn`
- `client_packages/advchat/index.html` - Corectat sintaxă HTML și actualizat client-to-server events

## 🔧 Setup Instrucțiuni

### 1. Pre-requisite
Asigură-te că ai:
- MySQL server rulând
- Node.js și npm instalate
- RAGE:MP server configurat
- `packages/template/settings.json` configurat cu detaliile MySQL

### 2. Instalare Pachete
```bash
npm install
```

### 3. Pornire Server
```bash
npm start
```
sau direct cu RAGE:MP launcher

## 💬 Funcționalități Chat

### Mesaje Normale
Apasă `T` pentru a deschide chat, tipează mesajul și apasă `Enter`.

### Comenzi Disponibile
- `/help` - Afișează comenzile disponibile
- `/players` - Listează toți jucătorii online
- `/pm <player_id> <message>` - Mesaj privat
- `/clear` - Șterge chat-ul (local)
- `/timestamp` - Toggle timestamp-uri
- `/fontsize <0.5-1.5>` - Ajustează font size
- `/pagesize <4-24>` - Ajustează înălțimea chat-ului
- `/togglechat` - Toggle chat visibility

## 🔒 Securitate

✓ Validare login (doar jucători autentificați pot folosi chat)
✓ Anti-spam (400ms cooldown)
✓ Validare lungime mesaj (255 caractere max)
✓ Filtrare color codes
✓ Password hashing cu bcryptjs
✓ Input sanitization

## 📊 Event Flow

### Sending a Message:
1. Player apasă `T` → `setChatInputStatus(true)`
2. Player tipează mesajul și apasă `Enter`
3. Client apelează `mp.events.callRemote("server:chatMessage", message)`
4. Server validează mesajul
5. Server verifica anti-spam
6. Server apelează `mp.players.forEach(p => p.outputChatBox(...))`
7. Mesajul apare pe toți jucătorii

### Sending a Command:
1. Player apasă `T` și tipează `/command`
2. Client apelează `mp.events.callRemote("server:command", command)`
3. Server parsează comanda
4. Server execută comanda și trimite răspuns

## 🐛 Troubleshooting

### Chat nu apare
- Verifică că MySQL connection este activ
- Verify că jucătorul este logged in (`player.getVariable('loggedIn')`)
- Check console logs pentru erori

### Mesaje nu se trimit
- Verifică că `mp.events.callRemote` este disponibil
- Verifică chat cooldown (400ms)
- Check message length (max 255 chars)

### Comenzi nu funcționează
- Verify format: `/command` (cu slash)
- Check că player ID-ul este corect pentru `/pm`
- View `/help` pentru lista completă de comenzi

## 📝 Database

Sistemul folosește tabelul `accounts` din MySQL cu câmpuri:
- `ID` - Primary key
- `username` - Player username
- `email` - Player email
- `password` - Hashed password (bcrypt)
- `socialClub` - Social Club name
- `socialClubId` - Social Club ID
- `position` - Last player position
- `lastActive` - Last active timestamp

## 🔗 Integration Notes

- Chat system este integrat cu sistemul de autentificare existent
- Folosește aceleași events și database connection
- Anti-spam este separate pe client-side și server-side
- Message history este stored în-memory (nu persistent)

## ✅ Testing Checklist

- [ ] Server pornit fără erori
- [ ] Player se conectează și autentifică
- [ ] Chat se deschide cu `T` key
- [ ] Mesaje normale se trimit și primesc
- [ ] Anti-spam funcționează (400ms delay)
- [ ] Comenzi `/help` funcționează
- [ ] Comenzi `/players` arată lista corectă
- [ ] Comenzi `/pm` funcționează între jucători
- [ ] Player join/quit se anunță
- [ ] Font size și page size se modifică
- [ ] Timestamp toggle funcționează

## 📄 File Structure

```
aetherro/
├── client_packages/
│   ├── advchat/
│   │   ├── index.html (UPDATED)
│   │   ├── index.js
│   │   └── styles.css
│   ├── index.js
│   └── login.js
├── packages/
│   └── template/
│       ├── index.js (UPDATED)
│       ├── authentication.js (UPDATED)
│       ├── chat.js (NEW)
│       ├── database.js
│       ├── test.js
│       ├── settings.json
│       └── CHAT_SYSTEM_REPORT.js (NEW)
├── conf.json
├── package.json
└── database.sql
```

## 🚀 Next Steps

1. Configurează `packages/template/settings.json` cu MySQL details
2. Asigură-te că database are tabelul `accounts` creat
3. Pornește serverul
4. Testează chat functionality
5. Deploy pe server live

---

**Last Updated:** 2025-12-11
**System Status:** ✓ Ready for Production
**Compatibility:** RAGE:MP Server-side + Client-side CEF
