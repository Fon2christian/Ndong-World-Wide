#!/bin/bash

# Renew SSL certificates and reload nginx
# Strict error handling
set -euo pipefail

# Trap errors
trap 'echo "❌ Error on line $LINENO. Exiting." >&2; exit 1' ERR

echo "### Renewing SSL certificates ..."

# Attempt to renew certificates
if docker-compose run --rm certbot renew; then
  echo "✓ Certificate renewal successful"

  # Test nginx configuration before reload
  echo "### Testing nginx configuration ..."
  if ! docker-compose exec nginx nginx -t; then
    echo "❌ Error: Nginx configuration test failed" >&2
    exit 1
  fi

  # Reload nginx only if renewal succeeded
  echo "### Reloading nginx ..."
  if docker-compose exec nginx nginx -s reload; then
    echo "✅ Nginx reloaded successfully"
  else
    echo "❌ Error: Failed to reload nginx" >&2
    exit 1
  fi
else
  echo "❌ Error: Certificate renewal failed" >&2
  echo "   Check certbot logs for details" >&2
  exit 1
fi
