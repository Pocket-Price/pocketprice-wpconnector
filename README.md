# Pocket Price Connector

> WordPress plugin that connects to the [Pocket Price](https://pocketprice.ru) API and displays services and prices via native Gutenberg blocks.

[![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple)](https://php.net)
[![License](https://img.shields.io/badge/License-GPL--2.0--or--later-green)](https://www.gnu.org/licenses/gpl-2.0.html)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange)](./readme.txt)

---

## Features

- **4 Gutenberg blocks** — integrate service price data directly in the block editor
- **PocketBase API integration** — pulls live data from the Pocket Price API
- **Caching layer** — WordPress transients-based cache with configurable TTL
- **WP-Cron** — background cache refresh to keep data fresh
- **Admin settings** — configure API URL, API key, and cache TTL from the dashboard
- **REST API proxy** — custom WordPress REST endpoints wrapping the Pocket Price API
- **Clean uninstall** — removes all plugin options and scheduled events on uninstall

---

## Blocks

| Block | Description |
|---|---|
| `service-category` | Grid of service categories |
| `service-collection` | Collection of services with prices |
| `service-single` | Single service detail card |
| `telex-data-table` | Structured data table for service listings |

---

## Requirements

| Requirement | Minimum |
|---|---|
| WordPress | 6.0 |
| PHP | 7.4 |
| Node.js | 18+ (build only) |

---

## Installation

### From WordPress Admin

1. Go to **Plugins → Add New**.
2. Search for **Pocket Price Connector**.
3. Click **Install Now** → **Activate**.

### Manual

```bash
# Clone into your plugins directory
cd wp-content/plugins
git clone https://github.com/evgrezanov/pocketprice-wpconnector.git
```

Then activate the plugin from **Plugins → Installed Plugins**.

---

## Development Setup

```bash
# Install Node dependencies
npm install

# Start development build (watch mode)
npm start

# Production build
npm run build
```

### Project Structure

```
pocketprice-wpconnector/
├── pocketprice-connector.php   # Main plugin file & bootstrap
├── uninstall.php               # Cleanup on uninstall
├── readme.txt                  # WordPress.org readme
├── assets/
│   ├── admin.css               # Admin styles
│   └── admin.js                # Admin scripts
├── includes/
│   ├── class-pocketprice-admin.php   # Settings page
│   ├── class-pocketprice-api.php     # API client
│   ├── class-pocketprice-blocks.php  # Block registration
│   ├── class-pocketprice-cache.php   # Transient cache
│   ├── class-pocketprice-cron.php    # Scheduled tasks
│   └── class-pocketprice-rest.php    # REST API endpoints
└── src/
    ├── blocks/
    │   ├── service-category/
    │   ├── service-collection/
    │   ├── service-single/
    │   └── telex-data-table/
    └── components/
        ├── ServiceCard.js
        └── ServiceTable.js
```

---

## Configuration

After activation go to **Settings → Pocket Price**:

| Setting | Default | Description |
|---|---|---|
| API URL | `https://api.pocketprice.ru` | Pocket Price API base URL |
| API Key | _(empty)_ | Your Pocket Price API key |
| Cache TTL | `3600` | Cache lifetime in seconds |

---

## Architecture

The plugin follows a singleton pattern. The main class `PocketPrice_Connector` bootstraps six modules:

```
PocketPrice_Connector
├── PocketPrice_API      — HTTP client for the Pocket Price API
├── PocketPrice_Cache    — Transient-based caching
├── PocketPrice_Cron     — WP-Cron background tasks
├── PocketPrice_Admin    — Admin settings UI
├── PocketPrice_Blocks   — Gutenberg block registration
└── PocketPrice_REST     — Custom REST API routes
```

Access the singleton anywhere:

```php
$plugin = pocketprice();
```

---

## Changelog

See [readme.txt](./readme.txt) for the full changelog.

### 1.0.0
- Initial release with 4 Gutenberg blocks, admin settings, REST API proxy, WP-Cron cache refresh, and clean uninstall.

---

## License

[GPL-2.0-or-later](https://www.gnu.org/licenses/gpl-2.0.html)
