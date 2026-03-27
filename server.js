const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const messagesFile = path.join(dataDir, 'messages.json');

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, '[]', 'utf8');
  }
}

function readMessages() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(messagesFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveMessages(messages) {
  ensureStorage();
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'K.B Dienstleistung website backend' });
});

app.post('/api/contact', (req, res) => {
  const { name, phone, email, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      message: 'Bitte fülle Name, E-Mail und Nachricht aus.'
    });
  }

  const entry = {
    id: Date.now().toString(),
    name: String(name).trim(),
    phone: String(phone || '').trim(),
    email: String(email).trim(),
    service: String(service || '').trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString()
  };

  const messages = readMessages();
  messages.unshift(entry);
  saveMessages(messages);

  res.json({
    ok: true,
    message: 'Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/impressum', (req, res) => {
  res.sendFile(path.join(publicDir, 'impressum.html'));
});

app.get('/datenschutz', (req, res) => {
  res.sendFile(path.join(publicDir, 'datenschutz.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
