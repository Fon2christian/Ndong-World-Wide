#!/bin/bash

# Renew SSL certificates and reload nginx

docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
