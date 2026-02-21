
=== Interactive Data Table Block ===

Contributors:      WordPress Telex
Tags:              block, table, data, interactive, datatable
Tested up to:      6.8
Stable tag:        0.1.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A powerful interactive data table block with search, filtering, sorting, and pagination capabilities.

== Description ==

The Interactive Data Table Block brings advanced data table functionality to WordPress. Display data from REST APIs or JSON sources with a rich set of interactive features.

**Key Features:**

* **Flexible Data Sources**: Connect to REST APIs or load JSON data
* **Real-time Search**: Filter table data as you type
* **Column Filtering**: Add dropdown filters for individual columns
* **Sortable Columns**: Click column headers to sort data
* **Pagination**: Control rows per page with customizable pagination
* **Loading States**: Professional loading indicators while fetching data
* **Error Handling**: Graceful error messages for failed requests
* **Responsive Design**: Mobile-friendly tables that adapt to screen sizes
* **Customizable Styling**: Control borders, row colors, and appearance
* **Editor Controls**: Comprehensive settings in the block inspector

**Perfect For:**

* Product catalogs
* Team directories
* Data dashboards
* API documentation
* Statistical reports
* Any tabular data display

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/telex-data-table` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Add the "Interactive Data Table" block to any post or page
4. Configure your data source URL and table settings in the block inspector
5. Customize the appearance and behavior to match your needs

== Frequently Asked Questions ==

= What data formats are supported? =

The block supports JSON data from REST APIs or direct JSON endpoints. The data should be an array of objects where each object represents a table row.

= Can I filter data by multiple columns? =

Yes! Enable column filters in the block settings, and users can filter by any column using the dropdown menus at the top of each column.

= Is the table responsive on mobile devices? =

Absolutely. The table includes responsive behavior options that make it mobile-friendly, with horizontal scrolling when needed.

= Can I customize the table appearance? =

Yes, you can control borders, alternating row colors, pagination settings, and more through the block inspector controls.

= How does search work? =

The search functionality filters rows in real-time as users type, searching across all visible columns for matching text.

== Screenshots ==

1. Interactive data table on the frontend with search and filters
2. Block editor controls for configuring data source and appearance
3. Column filter dropdowns in action
4. Responsive table view on mobile devices
5. Loading state while fetching data

== Changelog ==

= 0.1.0 =
* Initial release
* Real-time search functionality
* Column-based filtering
* Sortable columns
* Pagination support
* REST API and JSON data source support
* Customizable styling options
* Responsive design
* Loading and error states

== Usage ==

1. **Add the Block**: Insert the "Interactive Data Table" block into your post or page
2. **Set Data Source**: Enter your REST API or JSON endpoint URL in the block settings
3. **Configure Columns**: Select which columns to display and enable filtering if needed
4. **Customize Appearance**: Adjust pagination, styling, and responsive behavior
5. **Publish**: Save your changes and view the interactive table on your site

**Example Data Format:**

```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "status": "Active"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "department": "Marketing",
    "status": "Active"
  }
]
```

The block will automatically detect columns from your data structure.
