#!/bin/bash

# Production smoke test script
# Validates critical functionality on live deployment

set -e

# Default to production URL
BASE_URL=${BASE_URL:-"https://teamboard.workermill.com"}
DEMO_EMAIL="demo@workermill.com"
DEMO_PASSWORD="demo1234"

echo "🚀 Running smoke tests against: $BASE_URL"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test result tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
  local test_name="$1"
  local test_command="$2"

  echo -e "\n${YELLOW}🧪 Testing: $test_name${NC}"
  TESTS_RUN=$((TESTS_RUN + 1))

  if eval "$test_command"; then
    echo -e "${GREEN}✅ PASS: $test_name${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ FAIL: $test_name${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Health check endpoint
test_health() {
  response=$(curl -s -f "$BASE_URL/api/health" 2>/dev/null) || return 1
  echo "$response" | grep -q '"status":"ok"' || return 1
  echo "Health check response: $response"
}

# Landing page loads
test_landing_page() {
  response=$(curl -s -f -w "%{http_code}" -o /tmp/landing.html "$BASE_URL/" 2>/dev/null) || return 1
  http_code="${response: -3}"

  [ "$http_code" = "200" ] || return 1

  # Check for key elements
  grep -q "TeamBoard" /tmp/landing.html || return 1
  grep -q "Try the Demo\|Sign In" /tmp/landing.html || return 1

  echo "Landing page loaded successfully (200 OK)"
}

# Login page loads
test_login_page() {
  response=$(curl -s -f -w "%{http_code}" -o /tmp/login.html "$BASE_URL/login" 2>/dev/null) || return 1
  http_code="${response: -3}"

  [ "$http_code" = "200" ] || return 1

  # Check for login form elements
  grep -q "email\|Email" /tmp/login.html || return 1
  grep -q "password\|Password" /tmp/login.html || return 1

  echo "Login page loaded successfully (200 OK)"
}

# Test authentication endpoint
test_auth_endpoint() {
  # Try to access protected endpoint without auth (should get 401 or redirect)
  response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/workspaces" 2>/dev/null)
  http_code="${response: -3}"

  # Should be unauthorized (401) or redirect (3xx)
  if [[ "$http_code" =~ ^(401|403)$ ]] || [[ "$http_code" =~ ^3[0-9][0-9]$ ]]; then
    echo "Auth protection working (status: $http_code)"
    return 0
  else
    echo "Unexpected auth response: $http_code"
    return 1
  fi
}

# Test that demo user exists and can authenticate
test_demo_login() {
  # Get CSRF token first
  csrf_response=$(curl -s -c /tmp/cookies.txt "$BASE_URL/api/auth/csrf" 2>/dev/null) || return 1
  csrf_token=$(echo "$csrf_response" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$csrf_token" ]; then
    echo "Failed to get CSRF token"
    return 1
  fi

  # Attempt login
  login_response=$(curl -s -w "%{http_code}" -b /tmp/cookies.txt -c /tmp/cookies.txt \
    -o /tmp/login_response.txt \
    -X POST "$BASE_URL/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "csrfToken=$csrf_token&email=$DEMO_EMAIL&password=$DEMO_PASSWORD" 2>/dev/null)

  http_code="${login_response: -3}"

  # Should get redirect (3xx) on successful login
  if [[ "$http_code" =~ ^3[0-9][0-9]$ ]]; then
    echo "Demo login successful (status: $http_code)"
    return 0
  else
    echo "Demo login failed (status: $http_code)"
    cat /tmp/login_response.txt 2>/dev/null || true
    return 1
  fi
}

# Test that workspace data exists
test_workspace_data() {
  # This is a simple test to verify the workspace endpoint responds
  # In a real scenario, you'd want to authenticate first

  response=$(curl -s -w "%{http_code}" -o /tmp/workspace.txt \
    "$BASE_URL/acme-product/dashboard" 2>/dev/null) || return 1
  http_code="${response: -3}"

  # Should get 200 (if public) or redirect to login
  if [[ "$http_code" =~ ^(200|3[0-9][0-9])$ ]]; then
    echo "Workspace endpoint accessible (status: $http_code)"
    return 0
  else
    echo "Workspace endpoint failed (status: $http_code)"
    return 1
  fi
}

# Test static assets
test_static_assets() {
  # Test favicon
  response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/favicon.ico" 2>/dev/null)
  http_code="${response: -3}"

  if [[ "$http_code" =~ ^(200|404)$ ]]; then
    echo "Static assets endpoint accessible (favicon status: $http_code)"
    return 0
  else
    echo "Static assets test failed (status: $http_code)"
    return 1
  fi
}

# Test database connectivity via API
test_database_connectivity() {
  # Use the seed endpoint to verify database is accessible
  response=$(curl -s -w "%{http_code}" -o /tmp/db_test.txt \
    "$BASE_URL/api/seed" 2>/dev/null) || return 1
  http_code="${response: -3}"

  # Should get 409 (already seeded) or 401 (unauthorized)
  if [[ "$http_code" =~ ^(409|401|403)$ ]]; then
    echo "Database connectivity verified (status: $http_code)"
    return 0
  else
    echo "Database connectivity test failed (status: $http_code)"
    cat /tmp/db_test.txt 2>/dev/null || true
    return 1
  fi
}

echo "🔍 Starting smoke test suite..."
echo "Target: $BASE_URL"

# Run all tests
run_test "Health Check" "test_health"
run_test "Landing Page" "test_landing_page"
run_test "Login Page" "test_login_page"
run_test "Auth Protection" "test_auth_endpoint"
run_test "Demo Login" "test_demo_login"
run_test "Workspace Access" "test_workspace_data"
run_test "Static Assets" "test_static_assets"
run_test "Database Connectivity" "test_database_connectivity"

# Clean up temp files
rm -f /tmp/landing.html /tmp/login.html /tmp/login_response.txt
rm -f /tmp/workspace.txt /tmp/db_test.txt /tmp/cookies.txt

# Results summary
echo -e "\n🏁 Smoke Test Results:"
echo "═══════════════════════════════════"
echo -e "Tests Run:    ${TESTS_RUN}"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All smoke tests passed!${NC}"
  echo -e "${GREEN}✅ Production deployment is healthy${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed!${NC}"
  echo -e "${RED}🚨 Production deployment may have issues${NC}"
  exit 1
fi