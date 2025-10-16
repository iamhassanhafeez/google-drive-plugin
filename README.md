# WPMU DEV Plugin Test – Google Drive Integration

## Description

This plugin is part of the WPMU DEV Plugin Test for the Forminator Developer position.  
It implements a Google Drive integration for WordPress with the following features:

- Google Drive admin page in WP dashboard
- OAuth authentication and token storage
- File listing, upload, and folder creation
- Posts Maintenance page with edit/delete actions
- WP-CLI command: `wp wpmudev:drive list`
- REST API endpoints for credentials, file listing, upload, and folder creation

---

## Installation

1. Copy the `wpmudev-plugin-test` folder to your WordPress `wp-content/plugins` directory.
2. Activate the plugin from the WordPress admin.
3. Navigate to **Google Drive Test** in the admin menu.

---

## Running Unit Tests

> **Note:** Unit tests require a working WordPress environment. Update the path to `wp-load.php` in `tests/bootstrap.php` if necessary.

1. Install dev dependencies:

```
composer install
```

2. Running Unit Tests

```
vendor/bin/phpunit --bootstrap=tests/bootstrap.php tests/test-googledrive.php
```

## Development & Build Tasks

### Composer

Install composer packages:

```
composer install
```

### NPM

Install npm packages:

```
npm install

```

Commands

```
| Command         | Action                                              |
| --------------- | --------------------------------------------------- |
| npm run watch   | Compiles and watches for changes                    |
| npm run compile | Compile production-ready assets                     |
| npm run build   | Build production-ready bundle inside /build/ folder |

```

All functional requirements have been implemented:

- Google Drive admin page

- OAuth authentication

- File upload, listing, folder creation

- Posts Maintenance page

- WP-CLI command

- REST endpoints

- Unit tests are included in tests/. Update wp-load.php path if needed.

- Plugin can be installed in any WordPress environment for testing.

## WP-CLI Integration – Posts Maintenance

### Overview

A custom WP-CLI command `wp wpmudev:scan posts` has been implemented to execute the same post scanning logic as the **Posts Maintenance** admin interface.  
This allows developers or site administrators to trigger post maintenance directly from the command line, with progress indicators and support for post type filtering.

---

### Implementation Details

#### 📄 File:

`app/cli/class-posts-maintenance-cli.php`

#### 🧩 Namespace:

`WPMUDEV\PluginTest\App\CLI`

# Scan all published posts

```
wp wpmudev:scan posts
```

# Scan only pages

```
wp wpmudev:scan posts --post_type=page
```

# Scan a custom post type (e.g., product)

```
wp wpmudev:scan posts --post_type=product
```

### Output Example

```
wp wpmudev:scan posts --post_type=page

Scanning posts for types: page
Success: Scanned 1 page posts.
Success: All scans completed successfully!
```

## Notes

- The command uses the same logic as the Posts Maintenance admin interface.

- It safely updates the wpmudev_test_last_scan meta for each processed post.

- Supports flexible post type filtering via the --post_type argument.

- Built with proper error handling and progress indicators for large datasets.
