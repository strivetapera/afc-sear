#!/bin/bash
set -e

echo "Waiting for Keycloak to start..."
sleep 10

echo "Configuring Keycloak via kcadm.sh..."

KCADM="docker exec -i afc-sear-keycloak /opt/keycloak/bin/kcadm.sh"

# Authenticate with the master realm
$KCADM config credentials --server http://localhost:8080 --realm master --user admin --password admin

# Create the 'afc' realm if it doesn't exist
$KCADM create realms -s realm=afc -s enabled=true || echo "Realm 'afc' may already exist."

# Create the 'afc-api' client
$KCADM create clients -r afc -s clientId=afc-api -s publicClient=true -s directAccessGrantsEnabled=true -s "redirectUris=[\"*\"]" -s "webOrigins=[\"*\"]" || echo "Client 'afc-api' may already exist."

# Create roles
$KCADM create roles -r afc -s name=admin || echo "Role 'admin' may already exist."
$KCADM create roles -r afc -s name=member || echo "Role 'member' may already exist."

# Create a test admin user
$KCADM create users -r afc -s username=admin@afc.local -s email=admin@afc.local -s enabled=true || echo "User 'admin@afc.local' may already exist."

# Set the password for the test admin user
$KCADM set-password -r afc --username admin@afc.local --new-password admin

# Assign the admin role to the test user
$KCADM add-roles -r afc --uusername admin@afc.local --rolename admin || echo "Role already assigned."

echo "Keycloak setup complete."
