# BuddyHelps MentionMatch Dashboard

Dashboard for reviewing and responding to B2B writer requests from MentionMatch.

## Features

- **Webhook Endpoint**: Receives and stores incoming requests from MentionMatch
- **Request Dashboard**: Review all requests with status filtering
- **AI Draft Generation**: One-click draft responses using Claude Sonnet
- **Response Workflow**: Edit, copy, and track responses

## Setup

### 1. Clone and Install

```bash
git clone git@github.com:cameronobriendev/buddyhelps-mentionmatch.git
cd buddyhelps-mentionmatch
npm install
```

### 2. Create Turso Database

```bash
# Install Turso CLI if needed
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create buddyhelps-mentionmatch

# Get connection info
turso db show buddyhelps-mentionmatch --url
turso db tokens create buddyhelps-mentionmatch
```

### 3. Run Migration

```bash
turso db shell buddyhelps-mentionmatch < migrations/001_initial.sql
```

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
TURSO_DATABASE_URL=libsql://buddyhelps-mentionmatch-your-org.turso.io
TURSO_AUTH_TOKEN=your-token
ANTHROPIC_API_KEY=your-anthropic-key
WEBHOOK_SECRET=your-secret
```

### 5. Deploy to Vercel

```bash
vercel
```

Add the same environment variables in Vercel dashboard.

### 6. Connect MentionMatch

Email MentionMatch with your webhook URL:
```
https://your-domain.vercel.app/api/webhook/mentionmatch
```

They'll configure their system to POST requests to your endpoint.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhook/mentionmatch` | POST | Receives requests from MentionMatch |
| `/api/webhook/mentionmatch` | GET | Health check |
| `/api/requests` | GET | List all requests (optional `?status=new`) |
| `/api/requests` | PATCH | Update request status/response |
| `/api/draft` | POST | Generate Sonnet draft for a request |

## Workflow

1. MentionMatch sends writer request to webhook
2. Request stored in Turso database
3. Review requests in dashboard
4. Click "Generate with Sonnet" for AI draft
5. Edit draft as needed
6. Copy to clipboard and respond via MentionMatch/email
7. Mark as "Responded" to track

## Tech Stack

- Next.js 14
- Turso (SQLite at edge)
- Anthropic Claude Sonnet
- Tailwind CSS
- Vercel
