#!/bin/bash

echo ""
echo "========================================================"
echo "   FEDERAL SPENDING DASHBOARD: LAUNCHING"
echo "========================================================"
echo ""

# Check if Docker services are running
if ! docker compose ps | grep -q "running"; then
    echo "   [STARTING] Docker services..."
    docker compose up -d
    sleep 5
fi

echo "   [READY] PostgreSQL     -> localhost:5432"
echo "   [READY] Redis          -> localhost:6379"
echo "   [READY] Elasticsearch  -> localhost:9200"
echo ""
echo "   [STARTING] Backend server..."
echo "   [STARTING] Frontend server..."
echo ""
echo "-------------------------------------------------------"
echo "   Open your browser to:  http://localhost:5173"
echo "-------------------------------------------------------"
echo ""
echo "   Press Ctrl+C to stop all servers"
echo ""

# Start backend and frontend in parallel
cd backend && rails s -p 3000 &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both
wait
