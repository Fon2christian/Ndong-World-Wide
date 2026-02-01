#!/bin/bash

# Initialize Let's Encrypt SSL certificates
# Strict error handling
set -euo pipefail

# Trap errors and exit with message
trap 'echo "❌ Error on line $LINENO. Exiting." >&2; exit 1' ERR

# Configuration
domains=(example.com www.example.com)
rsa_key_size=4096
data_path="./certbot"
email="admin@example.com" # Add your email here

# Validate configuration
echo "### Validating configuration ..."
if [[ "${domains[0]}" == "example.com" ]]; then
  echo "❌ Error: Please update the 'domains' variable with your actual domain" >&2
  exit 1
fi

if [[ "$email" == "admin@example.com" ]]; then
  echo "❌ Error: Please update the 'email' variable with your actual email address" >&2
  exit 1
fi

# Check required commands
for cmd in docker docker-compose curl; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Error: Required command '$cmd' not found. Please install it first." >&2
    exit 1
  fi
done

# Create required directories
echo "### Creating directories ..."
mkdir -p "$data_path/conf/live/${domains[0]}"
mkdir -p "$data_path/www"

# Download recommended TLS parameters
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ]; then
  echo "### Downloading recommended TLS parameters ..."

  if ! curl --fail -sS -L \
    https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    > "$data_path/conf/options-ssl-nginx.conf"; then
    echo "❌ Error: Failed to download options-ssl-nginx.conf" >&2
    exit 1
  fi

  if ! curl --fail -sS -L \
    https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    > "$data_path/conf/ssl-dhparams.pem"; then
    echo "❌ Error: Failed to download ssl-dhparams.pem" >&2
    exit 1
  fi

  echo "✓ TLS parameters downloaded successfully"
fi

# Create dummy certificate for nginx initial startup
echo "### Creating dummy certificate for ${domains[0]} ..."
path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"

if ! docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot; then
  echo "❌ Error: Failed to create dummy certificate" >&2
  exit 1
fi

echo "✓ Dummy certificate created"

# Start nginx
echo "### Starting nginx ..."
if ! docker-compose up --force-recreate -d nginx; then
  echo "❌ Error: Failed to start nginx" >&2
  exit 1
fi

echo "✓ Nginx started"

# Delete dummy certificate
echo "### Deleting dummy certificate for ${domains[0]} ..."
if ! docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/${domains[0]} && \
  rm -Rf /etc/letsencrypt/archive/${domains[0]} && \
  rm -Rf /etc/letsencrypt/renewal/${domains[0]}.conf" certbot; then
  echo "⚠️  Warning: Failed to delete dummy certificate (continuing anyway)"
fi

# Request real certificate
echo "### Requesting Let's Encrypt certificate for ${domains[*]} ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

if ! docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $domain_args \
    --email \"$email\" \
    --rsa-key-size \"$rsa_key_size\" \
    --agree-tos \
    --force-renewal" certbot; then
  echo "❌ Error: Failed to obtain Let's Encrypt certificate" >&2
  echo "   Check that:" >&2
  echo "   - Domain DNS points to this server" >&2
  echo "   - Ports 80 and 443 are open" >&2
  echo "   - Domain is accessible from the internet" >&2
  exit 1
fi

echo "✓ Certificate obtained successfully"

# Test nginx configuration before reload
echo "### Testing nginx configuration ..."
if ! docker-compose exec -T nginx nginx -t; then
  echo "❌ Error: Nginx configuration test failed" >&2
  exit 1
fi

# Reload nginx
echo "### Reloading nginx ..."
if ! docker-compose exec -T nginx nginx -s reload; then
  echo "❌ Error: Failed to reload nginx" >&2
  exit 1
fi

echo ""
echo "✅ Let's Encrypt certificates issued and nginx reloaded successfully!"
echo "   Your site should now be accessible via HTTPS"
