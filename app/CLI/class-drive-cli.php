<?php
/**
 * WP-CLI command for Google Drive operations.
 *
 * Usage:
 *   wp wpmudev:drive list
 */

namespace WPMUDEV\PluginTest\App\CLI;

use WP_CLI;
use WP_CLI_Command;
use WP_REST_Request;
use WPMUDEV\PluginTest\Endpoints\V1\Drive_API;


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Drive_CLI extends WP_CLI_Command {

	/**
	 * List files from Google Drive.
	 *
	 * ## EXAMPLES
	 *
	 *     wp wpmudev:drive list
	 *
	 * @when after_wp_load
	 */
	public function list( $args, $assoc_args ) {
		WP_CLI::log( 'Fetching Google Drive files...' );

		try {
			$endpoint = new Drive_API();
			$endpoint->init(); // Ensure Google Client is initialized
			$request = new \WP_REST_Request( 'GET', '/wpmudev/v1/drive/files' );
			$response = $endpoint->list_files( $request );

			if ( is_wp_error( $response ) ) {
				WP_CLI::error( $response->get_error_message() );
			}

			$data = $response instanceof \WP_REST_Response ? $response->get_data() : $response;
			$files = $data['files'] ?? [];

			if ( empty( $files ) ) {
				WP_CLI::success( 'No files found in Google Drive.' );
				return;
			}

			WP_CLI\Utils\format_items(
				'table',
				array_map( function ( $file ) {
					return [
						'Name'     => $file['name'] ?? 'Unnamed',
						'Type'     => $file['mimeType'] ?? 'unknown',
						'Modified' => $file['modifiedTime'] ?? '',
					];
				}, $files ),
				[ 'Name', 'Type', 'Modified' ]
			);


		} catch ( \Exception $e ) {
			WP_CLI::error( 'Error fetching Drive files: ' . $e->getMessage() );
		}
	}
}
