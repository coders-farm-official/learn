# Coders Farm DNS Manager & Free Subdomain Service

A web application that gives anyone a free subdomain under `codersfarm.com` with a dashboard to manage DNS records. Every feature is paired with plain-language explanations that teach how DNS works.

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+

### Run locally (H2 database, no external dependencies)

```bash
cd subdomains-app
mvn spring-boot:run
```

Visit http://localhost:8080

### Run with PostgreSQL

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=subdomains
export DB_USER=codersfarm
export DB_PASSWORD=yourpassword

mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## Features

- **Free subdomain** — claim `yourname.codersfarm.com`
- **DNS record management** — A, AAAA, CNAME, TXT, MX records
- **Learn DNS curriculum** — contextual education on every action
- **Raw zone file view** — see the actual DNS zone representation
- **Account system** — email/password + magic link (passwordless) login
- **Abuse reporting** — public form + admin dashboard
- **Stale cleanup** — 90-day inactive subdomain cleanup with email warnings
- **Reserved name blocklist** — prevents impersonation and conflicts

## Architecture

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.4 (Java 21) |
| Frontend | Thymeleaf (server-side rendering) |
| Database | H2 (dev) / PostgreSQL (prod) |
| DNS Provider | Cloudflare API (currently stubbed with mock) |
| Auth | Spring Security (session-based) |
| Email | Spring Mail (configure SMTP for production) |

## Configuration

Key settings in `application.yml`:

| Property | Default | Description |
|----------|---------|-------------|
| `app.base-domain` | `codersfarm.com` | Base domain for subdomains |
| `app.max-records-per-subdomain` | `20` | Max DNS records per subdomain |
| `app.stale-days` | `90` | Days before inactive subdomain cleanup |
| `cloudflare.api-token` | `stub` | Cloudflare API token (set env `CLOUDFLARE_API_TOKEN`) |
| `cloudflare.zone-id` | `stub` | Cloudflare zone ID (set env `CLOUDFLARE_ZONE_ID`) |

## DNS Provider

The app uses a `CloudflareService` interface. The default `MockCloudflareService` simulates API calls for development. To connect to a real Cloudflare zone:

1. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` environment variables
2. Implement `CloudflareService` with real Cloudflare API calls
3. The interface also supports swapping to GoDaddy or other providers

## Project Structure

```
src/main/java/com/codersfarm/subdomains/
├── SubdomainsApplication.java
├── config/          # Security config
├── controller/      # Web controllers (Auth, Dashboard, Claim, Learn, Admin, API)
├── dto/             # Form objects with validation
├── model/           # JPA entities (User, Subdomain, DnsRecord, AbuseReport, CurriculumProgress)
├── repository/      # Spring Data JPA repositories
└── service/         # Business logic + CloudflareService interface
```
