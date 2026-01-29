# Federal Spending Dashboard

A full-stack application for exploring federal spending data from USAspending.gov. Built with Rails API and React.

## Features

- **Data Pipeline**: Automated ingestion from USAspending.gov API (coming soon)
- **Search**: Full-text search with PostgreSQL (Elasticsearch upgrade planned)
- **Analytics Dashboard**: Interactive visualizations of spending trends
- **Filtering**: Filter by agency, recipient, state, date range, and award type

## Tech Stack

**Backend**
- Ruby on Rails 8 (API mode)
- PostgreSQL
- Sidekiq + Redis (background jobs)

**Frontend** (coming in Milestone 3)
- React 18
- Vite
- Recharts
- TailwindCSS

## Architecture
```
┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│   Rails API     │
└─────────────────┘     └────────┬────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  PostgreSQL   │      │     Redis       │      │ Elasticsearch   │
│  (primary)    │      │   (Sidekiq)     │      │   (planned)     │
└───────────────┘      └─────────────────┘      └─────────────────┘
```

## Local Development Setup

### Prerequisites

- Ruby 3.2+
- Rails 8
- PostgreSQL
- Node.js 18+ (for frontend)

### Backend Setup
```bash
cd backend
bundle install
cp .env.example .env
rails db:create db:migrate db:seed
rails s
```

API runs at http://localhost:3000

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/awards` | List awards with filters |
| `GET /api/v1/awards/:id` | Award details |
| `GET /api/v1/agencies` | List all agencies |
| `GET /api/v1/agencies/:id` | Agency details with stats |
| `GET /api/v1/recipients` | List recipients |
| `GET /api/v1/recipients/:id` | Recipient details |
| `GET /api/v1/search?q=query` | Full-text search |
| `GET /api/v1/stats/overview` | Dashboard overview stats |
| `GET /api/v1/stats/spending_over_time` | Time series data |
| `GET /api/v1/stats/by_agency` | Spending by agency |
| `GET /api/v1/stats/by_state` | Spending by state |
| `GET /api/v1/stats/by_type` | Spending by award type |

### Query Parameters

**Awards endpoint filters:**
- `agency_id` - Filter by agency
- `award_type` - contract, grant, loan, direct_payment, other
- `state` - Two-letter state code
- `start_date` / `end_date` - Date range
- `min_amount` / `max_amount` - Amount range
- `page` / `per_page` - Pagination

## Data Model
```
agencies
├── name, code, description

recipients
├── name, recipient_type, city, state, country

awards
├── agency_id, recipient_id
├── award_type, amount, description
├── awarded_on, period_of_performance_start/end
├── place_of_performance_state, usaspending_id

sync_logs
├── sync_type, status, started_at, completed_at
├── records_processed, error_message, metadata
```

## Roadmap

- [x] Milestone 1: Foundation (models, migrations, API endpoints)
- [ ] Milestone 2: USAspending API integration
- [ ] Milestone 3: React dashboard
- [ ] Milestone 4: Elasticsearch integration
- [ ] Milestone 5: Data visualizations
- [ ] Milestone 6: Polish and deploy

## License

MIT