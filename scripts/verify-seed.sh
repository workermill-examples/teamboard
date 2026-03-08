#!/bin/bash

# Verify seed data script
# Validates that the database has been properly seeded with expected data

set -e

EXPECTED_CARDS=${EXPECTED_CARDS:-30}

echo "🔍 Verifying database seed data..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Function to run SQL query and get count
query_count() {
  local query="$1"
  local table="$2"

  # Use node to execute the query via Prisma
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    async function main() {
      try {
        const result = await prisma.\$queryRaw\`$query\`;
        console.log(result[0].count);
      } catch (error) {
        console.error('Query failed:', error.message);
        process.exit(1);
      } finally {
        await prisma.\$disconnect();
      }
    }

    main();
  "
}

echo "📊 Running validation checks..."

# Check demo user exists
echo -n "Checking demo user... "
USER_COUNT=$(query_count "SELECT COUNT(*) as count FROM users WHERE email = 'demo@workermill.com'" "users")
if [ "$USER_COUNT" -eq 1 ]; then
  echo "✅ Demo user found"
else
  echo "❌ Demo user not found (expected: 1, found: $USER_COUNT)"
  exit 1
fi

# Check workspace exists
echo -n "Checking workspace... "
WORKSPACE_COUNT=$(query_count "SELECT COUNT(*) as count FROM workspaces WHERE slug = 'acme-product'" "workspaces")
if [ "$WORKSPACE_COUNT" -eq 1 ]; then
  echo "✅ Workspace found"
else
  echo "❌ Workspace not found (expected: 1, found: $WORKSPACE_COUNT)"
  exit 1
fi

# Check total users (demo + 3 members = 4)
echo -n "Checking total users... "
TOTAL_USERS=$(query_count "SELECT COUNT(*) as count FROM users" "users")
if [ "$TOTAL_USERS" -eq 4 ]; then
  echo "✅ All users found ($TOTAL_USERS)"
else
  echo "❌ Incorrect user count (expected: 4, found: $TOTAL_USERS)"
  exit 1
fi

# Check workspace members (4 total)
echo -n "Checking workspace members... "
MEMBER_COUNT=$(query_count "SELECT COUNT(*) as count FROM workspace_members" "workspace_members")
if [ "$MEMBER_COUNT" -eq 4 ]; then
  echo "✅ All workspace members found ($MEMBER_COUNT)"
else
  echo "❌ Incorrect member count (expected: 4, found: $MEMBER_COUNT)"
  exit 1
fi

# Check boards (3 boards: Product Roadmap, Sprint 14, Bug Tracker)
echo -n "Checking boards... "
BOARD_COUNT=$(query_count "SELECT COUNT(*) as count FROM boards" "boards")
if [ "$BOARD_COUNT" -eq 3 ]; then
  echo "✅ All boards found ($BOARD_COUNT)"
else
  echo "❌ Incorrect board count (expected: 3, found: $BOARD_COUNT)"
  exit 1
fi

# Check specific board titles
echo -n "Checking board titles... "
ROADMAP_COUNT=$(query_count "SELECT COUNT(*) as count FROM boards WHERE title = 'Product Roadmap'" "boards")
SPRINT_COUNT=$(query_count "SELECT COUNT(*) as count FROM boards WHERE title = 'Sprint 14'" "boards")
BUG_COUNT=$(query_count "SELECT COUNT(*) as count FROM boards WHERE title = 'Bug Tracker'" "boards")

if [ "$ROADMAP_COUNT" -eq 1 ] && [ "$SPRINT_COUNT" -eq 1 ] && [ "$BUG_COUNT" -eq 1 ]; then
  echo "✅ All board titles correct"
else
  echo "❌ Missing expected boards (Roadmap: $ROADMAP_COUNT, Sprint: $SPRINT_COUNT, Bug: $BUG_COUNT)"
  exit 1
fi

# Check columns (5 + 4 + 3 = 12 total)
echo -n "Checking columns... "
COLUMN_COUNT=$(query_count "SELECT COUNT(*) as count FROM columns" "columns")
if [ "$COLUMN_COUNT" -eq 12 ]; then
  echo "✅ All columns found ($COLUMN_COUNT)"
else
  echo "❌ Incorrect column count (expected: 12, found: $COLUMN_COUNT)"
  exit 1
fi

# Check cards (main validation - should be 30 total: 12 + 10 + 8)
echo -n "Checking cards... "
CARD_COUNT=$(query_count "SELECT COUNT(*) as count FROM cards" "cards")
if [ "$CARD_COUNT" -eq "$EXPECTED_CARDS" ]; then
  echo "✅ All cards found ($CARD_COUNT)"
else
  echo "❌ Incorrect card count (expected: $EXPECTED_CARDS, found: $CARD_COUNT)"
  exit 1
fi

# Check labels (5 labels)
echo -n "Checking labels... "
LABEL_COUNT=$(query_count "SELECT COUNT(*) as count FROM labels" "labels")
if [ "$LABEL_COUNT" -eq 5 ]; then
  echo "✅ All labels found ($LABEL_COUNT)"
else
  echo "❌ Incorrect label count (expected: 5, found: $LABEL_COUNT)"
  exit 1
fi

# Check activities (25 activities)
echo -n "Checking activities... "
ACTIVITY_COUNT=$(query_count "SELECT COUNT(*) as count FROM activities" "activities")
if [ "$ACTIVITY_COUNT" -eq 25 ]; then
  echo "✅ All activities found ($ACTIVITY_COUNT)"
else
  echo "❌ Incorrect activity count (expected: 25, found: $ACTIVITY_COUNT)"
  exit 1
fi

# Check comments (at least 5)
echo -n "Checking comments... "
COMMENT_COUNT=$(query_count "SELECT COUNT(*) as count FROM comments" "comments")
if [ "$COMMENT_COUNT" -ge 5 ]; then
  echo "✅ Comments found ($COMMENT_COUNT)"
else
  echo "❌ Insufficient comments (expected: >= 5, found: $COMMENT_COUNT)"
  exit 1
fi

# Check checklist items (at least 15: 3 items × 5 cards)
echo -n "Checking checklist items... "
CHECKLIST_COUNT=$(query_count "SELECT COUNT(*) as count FROM checklist_items" "checklist_items")
if [ "$CHECKLIST_COUNT" -ge 15 ]; then
  echo "✅ Checklist items found ($CHECKLIST_COUNT)"
else
  echo "❌ Insufficient checklist items (expected: >= 15, found: $CHECKLIST_COUNT)"
  exit 1
fi

# Check card labels (should have some)
echo -n "Checking card labels... "
CARD_LABEL_COUNT=$(query_count "SELECT COUNT(*) as count FROM card_labels" "card_labels")
if [ "$CARD_LABEL_COUNT" -gt 0 ]; then
  echo "✅ Card labels found ($CARD_LABEL_COUNT)"
else
  echo "❌ No card labels found"
  exit 1
fi

# Check board stars (at least 2)
echo -n "Checking board stars... "
STAR_COUNT=$(query_count "SELECT COUNT(*) as count FROM board_stars" "board_stars")
if [ "$STAR_COUNT" -ge 2 ]; then
  echo "✅ Board stars found ($STAR_COUNT)"
else
  echo "❌ Insufficient board stars (expected: >= 2, found: $STAR_COUNT)"
  exit 1
fi

# Summary
echo ""
echo "🎉 Seed data validation completed successfully!"
echo ""
echo "📈 Summary:"
echo "  Users: $TOTAL_USERS"
echo "  Workspace members: $MEMBER_COUNT"
echo "  Boards: $BOARD_COUNT"
echo "  Columns: $COLUMN_COUNT"
echo "  Cards: $CARD_COUNT"
echo "  Labels: $LABEL_COUNT"
echo "  Activities: $ACTIVITY_COUNT"
echo "  Comments: $COMMENT_COUNT"
echo "  Checklist items: $CHECKLIST_COUNT"
echo "  Card labels: $CARD_LABEL_COUNT"
echo "  Board stars: $STAR_COUNT"
echo ""
echo "✅ All validation checks passed!"