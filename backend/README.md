# Backend API

Rails 8 API serving federal spending data.

## Development
```
rails s -p 3000
```

## Key Files

- `app/models/` - Award, Agency, Recipient, SyncLog
- `app/controllers/api/v1/` - REST endpoints
- `app/services/` - USAspending API client, data importer

## Testing
```
bundle exec rspec
```

## Environment Variables

See `.env.example`