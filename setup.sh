#!/bin/bash

set -e

echo ""
echo "========================================================"
echo "   FEDERAL SPENDING DASHBOARD: THE INSTALLATION"
echo "========================================================"
echo ""
echo "   Press any key to begin your quest..."
read -n 1 -s
echo ""

# LEVEL 1
echo "-------------------------------------------------------"
echo "   LEVEL 1: CHECKING YOUR INVENTORY"
echo "-------------------------------------------------------"
echo ""

sleep 1
echo "   [SCANNING] Docker..."
if ! command -v docker &> /dev/null; then
    echo "   [FAILED] Docker not found in inventory!"
    echo "            Acquire it from: https://www.docker.com/products/docker-desktop"
    echo ""
    echo "   GAME OVER"
    exit 1
fi
echo "   [OK] Docker equipped!"

sleep 0.5
echo "   [SCANNING] Node.js..."
if ! command -v node &> /dev/null; then
    echo "   [FAILED] Node.js not found in inventory!"
    echo "            Acquire it from: https://nodejs.org"
    echo ""
    echo "   GAME OVER"
    exit 1
fi
echo "   [OK] Node.js equipped!"

sleep 0.5
echo "   [SCANNING] Ruby..."
if ! command -v ruby &> /dev/null; then
    echo "   [FAILED] Ruby not found in inventory!"
    echo "            Acquire it via rbenv: https://github.com/rbenv/rbenv"
    echo ""
    echo "   GAME OVER"
    exit 1
fi
echo "   [OK] Ruby equipped!"

echo ""
echo "   >>> LEVEL 1 COMPLETE <<<"
sleep 1

# LEVEL 2
echo ""
echo "-------------------------------------------------------"
echo "   LEVEL 2: SUMMONING THE SERVICES"
echo "-------------------------------------------------------"
echo ""
echo "   Summoning PostgreSQL..."
echo "   Summoning Redis..."
echo "   Summoning Elasticsearch..."
echo ""
docker compose up -d
echo ""
echo "   [WAITING] Services awakening"
for i in {1..10}; do
    echo -n "."
    sleep 1
done
echo " READY!"

echo ""
echo "   >>> LEVEL 2 COMPLETE <<<"
sleep 1

# LEVEL 3
echo ""
echo "-------------------------------------------------------"
echo "   LEVEL 3: FORGING THE BACKEND"
echo "-------------------------------------------------------"
echo ""
cd backend

echo "   [CRAFTING] Installing gems..."
bundle install --quiet

echo "   [CRAFTING] Creating database..."
cp .env.example .env 2>/dev/null || true
rails db:create db:migrate --quiet

echo "   [SYNCING] Fetching real data from USAspending.gov..."
echo "   [SYNCING] This may take a minute..."
rails runner "AwardImporter.new(award_type: 'contracts').import(pages: 3)"
rails runner "AwardImporter.new(award_type: 'grants').import(pages: 2)"

echo "   [CRAFTING] Indexing search..."
rails runner "Award.reindex"

cd ..

echo ""
echo "   >>> LEVEL 3 COMPLETE <<<"
sleep 1

# LEVEL 4
echo ""
echo "-------------------------------------------------------"
echo "   LEVEL 4: FORGING THE FRONTEND"
echo "-------------------------------------------------------"
echo ""
cd frontend

echo "   [CRAFTING] Installing packages..."
npm install --silent

cd ..

echo ""
echo "   >>> LEVEL 4 COMPLETE <<<"
sleep 1

# VICTORY
echo ""
echo "========================================================"
echo ""
echo "   *** CONGRATULATIONS ***"
echo ""
echo "   You have successfully installed the"
echo "   FEDERAL SPENDING DASHBOARD"
echo ""
echo "   Your adventure continues with:"
echo ""
echo "       ./start.sh"
echo ""
echo "========================================================"
echo ""
