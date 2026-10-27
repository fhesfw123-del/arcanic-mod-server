const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const MODS_DIR = path.join(__dirname, 'mods');
const VERSIONS_FILE = path.join(__dirname, 'versions.json');

if (!fs.existsSync(MODS_DIR)) {
  fs.mkdirSync(MODS_DIR, { recursive: true });
}

if (!fs.existsSync(VERSIONS_FILE)) {
  fs.writeFileSync(VERSIONS_FILE, JSON.stringify({}, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, MODS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === '.jar') {
      cb(null, true);
    } else {
      cb(new Error('Только JAR файлы разрешены'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use('/mods', express.static(MODS_DIR));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Arcanic Mod Update Server</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
        p { color: #666; margin-bottom: 30px; }
        .upload-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        label { font-weight: 600; color: #333; font-size: 14px; }
        input[type="text"], input[type="file"] {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        input[type="text"]:focus, input[type="file"]:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .progress-container {
          display: none;
          margin-top: 20px;
        }
        .progress-bar {
          width: 100%;
          height: 30px;
          background: #e0e0e0;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          width: 0%;
          transition: width 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }
        .mods-list { margin-top: 40px; border-top: 2px solid #e0e0e0; padding-top: 30px; }
        .mods-list h2 { color: #333; margin-bottom: 20px; font-size: 22px; }
        .mod-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mod-info { display: flex; flex-direction: column; gap: 5px; }
        .mod-name { font-weight: 600; color: #333; }
        .mod-version { color: #666; font-size: 14px; }
        .mod-delete {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .mod-delete:hover { background: #c82333; }
        .message {
          padding: 12px;
          border-radius: 8px;
          margin-top: 20px;
          display: none;
        }
        .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎮 Arcanic Mod Update Server</h1>
        <p>Загрузите новую версию мода для автоматического обновления в лаунчере</p>

        <form class="upload-form" onsubmit="uploadMod(event)" id="uploadForm">
          <div class="form-group">
            <label for="modName">Название мода (латиницей)</label>
            <input type="text" id="modName" required placeholder="arcanic-visuals">
          </div>

          <div class="form-group">
            <label for="version">Версия</label>
            <input type="text" id="version" required placeholder="1.0.0">
          </div>

          <div class="form-group">
            <label for="file">JAR файл мода</label>
            <input type="file" id="file" accept=".jar" required>
          </div>

          <button type="submit" id="uploadBtn">📦 Загрузить обновление</button>
        </form>

        <div class="progress-container" id="progressContainer">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill">0%</div>
          </div>
        </div>

        <div class="message" id="message"></div>

        <div class="mods-list">
          <h2>📋 Загруженные моды</h2>
          <div id="modsList"></div>
        </div>
      </div>

      <script>
        async function loadMods() {
          try {
            const res = await fetch('/api/versions');
            const versions = await res.json();
            const container = document.getElementById('modsList');

            if (Object.keys(versions).length === 0) {
              container.innerHTML = '<p style="color: #999;">Моды ещё не загружены</p>';
              return;
            }

            container.innerHTML = Object.entries(versions).map(([name, data]) => \`
              <div class="mod-item">
                <div class="mod-info">
                  <span class="mod-name">\${name}</span>
                  <span class="mod-version">Версия: \${data.version} • \${data.date}</span>
                </div>
                <button class="mod-delete" onclick="deleteMod('\${name}')">🗑 Удалить</button>
              </div>
            \`).join('');
          } catch (err) {
            console.error('Ошибка загрузки модов:', err);
          }
        }

        async function uploadMod(e) {
          e.preventDefault();

          const modName = document.getElementById('modName').value;
          const version = document.getElementById('version').value;
          const file = document.getElementById('file').files[0];

          const formData = new FormData();
          formData.append('mod', file);
          formData.append('modName', modName);
          formData.append('version', version);

          const message = document.getElementById('message');
          const progressContainer = document.getElementById('progressContainer');
          const progressFill = document.getElementById('progressFill');
          const uploadBtn = document.getElementById('uploadBtn');

          message.style.display = 'none';
          progressContainer.style.display = 'block';
          uploadBtn.disabled = true;

          try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                progressFill.style.width = percentComplete + '%';
                progressFill.textContent = percentComplete + '%';
              }
            });

            xhr.addEventListener('load', () => {
              progressContainer.style.display = 'none';
              uploadBtn.disabled = false;

              if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                message.className = 'message success';
                message.textContent = '✅ ' + result.message;
                message.style.display = 'block';
                document.getElementById('uploadForm').reset();
                loadMods();
              } else {
                const result = JSON.parse(xhr.responseText);
                throw new Error(result.error);
              }
            });

            xhr.addEventListener('error', () => {
              progressContainer.style.display = 'none';
              uploadBtn.disabled = false;
              message.className = 'message error';
              message.textContent = '❌ Ошибка сети';
              message.style.display = 'block';
            });

            xhr.open('POST', '/api/upload');
            xhr.send(formData);
          } catch (err) {
            progressContainer.style.display = 'none';
            uploadBtn.disabled = false;
            message.className = 'message error';
            message.textContent = '❌ ' + err.message;
            message.style.display = 'block';
          }
        }

        async function deleteMod(name) {
          if (!confirm(\`Удалить мод \${name}?\`)) return;

          try {
            const res = await fetch(\`/api/delete/\${name}\`, { method: 'DELETE' });
            const result = await res.json();

            if (res.ok) {
              loadMods();
            } else {
              alert('Ошибка: ' + result.error);
            }
          } catch (err) {
            alert('Ошибка: ' + err.message);
          }
        }

        loadMods();
      </script>
    </body>
    </html>
  `);
});

app.get('/api/versions', (req, res) => {
  try {
    const versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения версий' });
  }
});

app.post('/api/upload', upload.single('mod'), (req, res) => {
  try {
    const { modName, version } = req.body;
    const file = req.file;

    if (!modName || !version || !file) {
      return res.status(400).json({ error: 'Не все поля заполнены' });
    }

    const versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));

    versions[modName] = {
      version: version,
      filename: file.filename,
      size: file.size,
      date: new Date().toLocaleString('ru-RU')
    };

    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2));

    res.json({
      message: `Мод ${modName} версии ${version} успешно загружен`,
      mod: versions[modName]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки мода' });
  }
});

app.delete('/api/delete/:modName', (req, res) => {
  try {
    const { modName } = req.params;

    const versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));

    if (!versions[modName]) {
      return res.status(404).json({ error: 'Мод не найден' });
    }

    const modPath = path.join(MODS_DIR, versions[modName].filename);
    if (fs.existsSync(modPath)) {
      fs.unlinkSync(modPath);
    }

    delete versions[modName];

    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2));

    res.json({ message: `Мод ${modName} успешно удалён` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления мода' });
  }
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🎮 Arcanic Mod Update Server         ║
║  📡 Запущен на http://localhost:${PORT}  ║
╚════════════════════════════════════════╝
  `);
});
