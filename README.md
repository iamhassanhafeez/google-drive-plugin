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

# Development & Build Tasks

## Composer

Install composer packages:

```
composer install
```

## NPM

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
