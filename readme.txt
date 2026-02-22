=== Pocket Price Connector ===
Contributors: pocketprice
Tags: price list, services, gutenberg blocks, api, pocketbase
Requires at least: 6.0
Tested up to: 6.7
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connector plugin for Pocket Price API — displays services and prices via Gutenberg blocks.

== Description ==

**Pocket Price Connector** integrates your WordPress site with the [Pocket Price](https://pocketprice.ru) API and lets you display service catalogues and prices using native Gutenberg blocks — no shortcodes, no page builders required.

= Key Features =

* **4 ready-made Gutenberg blocks** — drop them anywhere in the block editor
* **REST API integration** — pulls live data from the Pocket Price (PocketBase) API
* **Built-in caching** — configurable TTL reduces API calls and speeds up page loads
* **WP-Cron support** — automatically refreshes cached data in the background
* **Admin settings page** — configure the API URL, API key, and cache TTL from the WordPress dashboard
* **Clean uninstall** — removes all plugin data on uninstall

= Available Blocks =

1. **Service Category** — displays a grid of service categories fetched from the API
2. **Service Collection** — shows a collection of services with prices
3. **Service Single** — renders a single service card with full details
4. **Telex Data Table** — outputs a structured data table for service listings

= Requirements =

* WordPress 6.0 or higher
* PHP 7.4 or higher
* A valid Pocket Price API endpoint and key

== Installation ==

= Automatic installation =

1. Log in to your WordPress dashboard.
2. Go to **Plugins → Add New**.
3. Search for **Pocket Price Connector**.
4. Click **Install Now**, then **Activate**.

= Manual installation =

1. Download the plugin ZIP file.
2. Go to **Plugins → Add New → Upload Plugin**.
3. Choose the ZIP file and click **Install Now**, then **Activate**.

= After activation =

1. Go to **Settings → Pocket Price** in your WordPress dashboard.
2. Enter your **API URL** (default: `https://api.pocketprice.ru`).
3. Enter your **API Key**.
4. Set the desired **Cache TTL** in seconds (default: `3600`).
5. Click **Save Settings**.
6. Open any page or post in the block editor and add one of the **Pocket Price** blocks.

== Frequently Asked Questions ==

= Where do I get an API key? =

Sign up or log in at [pocketprice.ru](https://pocketprice.ru) and generate an API key from your account dashboard.

= What is the default API endpoint? =

The default endpoint is `https://api.pocketprice.ru`. You can override it on the plugin settings page if you host your own PocketBase instance.

= How does caching work? =

API responses are stored in the WordPress transients cache. The TTL (time-to-live) is configurable in the admin settings. WP-Cron runs background tasks to refresh the cache before it expires.

= Can I use the blocks with classic themes? =

The blocks are registered for the Gutenberg block editor (WordPress 5.0+). They will work with any block-compatible theme. The classic (non-block) editor is not supported.

= Does the plugin collect any user data? =

No. The plugin communicates only with the configured Pocket Price API endpoint and does not collect or transmit any personal user data.

= How do I clear the cache manually? =

Go to **Settings → Pocket Price** and use the **Clear Cache** button, or simply reduce the TTL value and save.

== Screenshots ==

1. Admin settings page — configure API URL, key, and cache TTL.
2. Block editor — inserting a Service Collection block.
3. Front-end output — a rendered service price list.

== Changelog ==

= 1.0.0 =
* Initial release.
* Added Service Category, Service Collection, Service Single, and Telex Data Table blocks.
* Added admin settings page (API URL, API Key, Cache TTL).
* Added REST API proxy endpoints.
* Added WP-Cron background cache refresh.
* Added clean uninstall routine.

== Upgrade Notice ==

= 1.0.0 =
Initial release. No upgrade steps required.
