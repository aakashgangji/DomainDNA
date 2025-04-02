# Domain Verifier
Verify if the domain you want to buy is Haunted or not?

## How to Run:

#### Environment Variables

```bash
export BRAVE_SEARCH_AI_API_KEY= yourpapikey

export gemini=your gemini key
```

#### Nginx

1. Open nginx config and set the following as server
```
conf
    server {
        listen       80;
        server_name  localhost;
        client_max_body_size 100M;

        location /api/v1 {
            proxy_pass http://localhost:8081;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
```

2. Verify and restart nginx server
```bash
sudo nginx -t
sudo systemctl restart nginx.service
```
For mac instead of systemctl use `brew services restart nginx`

#### Backend

```bash
cd backend
conda env create -f env.yaml
conda activate domaindna
python -m uvicorn api:app --port 8081
```

#### Frontend

```bash
cd Frontend/front
npm i
npm run dev or npm start
```
Now head to the given url `localhost:3000`

#### Extension

1. Go to Manage Extension in Google Chrome
2. Turn on Developer Mode
3. Click on Load Unpacked
4. Browse to `path/to/repo/extension` (extension dir) and Select it
5. Go to godaddy.com, search for a domain and wait for a couple of minutes for it to start tagging
