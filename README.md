# Receipt Flash Upload Worker

Cloudflare Worker that receives Excel file uploads and stores them in R2.

## Setup

1. Clone this repo
2. Run `npm install`
3. `npx wrangler login` (authenticate with Cloudflare)
4. `npm run deploy`

## API

POST `/` — multipart form data

Fields:
- `file` (required) — the Excel file
- `email` — client email
- `name` — client name
- `project` — project name
- `notes` — additional notes

Response:
```json
{
  "success": true,
  "ref": "RF-123456",
  "fileKey": "uploads/1234567890-file.xlsx",
  "fileName": "CE-W001_v4.xlsx",
  "fileSize": 12345
}
```
