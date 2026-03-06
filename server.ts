import express from "express";
import { createServer as createViteServer } from "vite";
import archiver from "archiver";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Enable CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  const DATA_FILE = path.join(process.cwd(), 'data.json');

  app.get("/api/sync", (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('Error reading data file:', error);
      res.status(500).json({ error: 'Failed to read data' });
    }
  });

  app.post("/api/sync", (req, res) => {
    try {
      const data = req.body;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error writing data file:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  app.get("/api/download-source", (req, res) => {
    res.attachment("project-source.zip");
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    archive.on("error", (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add directories
    if (fs.existsSync("src")) {
      archive.directory("src/", "src");
    }
    if (fs.existsSync("public")) {
      archive.directory("public/", "public");
    }

    // Add files
    const files = [
      "package.json", 
      "tsconfig.json", 
      "tsconfig.app.json", 
      "tsconfig.node.json", 
      "vite.config.ts", 
      "index.html", 
      "server.ts", 
      ".env.example", 
      "eslint.config.js"
    ];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: file });
      }
    });

    archive.finalize();
  });

  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      prompt: 'select_account',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    let email = 'google@example.com';
    let name = 'Google User';
    
    try {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: code as string,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const userData = await userResponse.json();
          if (userData.email) {
            email = userData.email;
            name = userData.name || email.split('@')[0];
          }
        }
      }
    } catch (e) {
      console.error('Error exchanging code:', e);
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: { email: '${email}', name: '${name}' } }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
