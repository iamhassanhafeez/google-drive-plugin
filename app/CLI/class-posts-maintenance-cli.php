<?php
/**
 * WP-CLI command for Posts Maintenance operations.
 *
 * Usage:
 *   wp wpmudev:scan posts
 */

namespace WPMUDEV\PluginTest\App\CLI;

use WP_CLI;
use WP_CLI_Command;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Posts_Maintenance_CLI extends WP_CLI_Command {

	/**
	 * Scan posts and update meta.
	 *
	 * ## OPTIONS
	 *
	 * [--post_type=<post_type>]
	 * : Specify post type(s) to scan. Default: post, page.
	 *
	 * ## EXAMPLES
	 *
	 *     wp wpmudev:scan posts
	 *     wp wpmudev:scan posts --post_type=page
	 *     wp wpmudev:scan posts --post_type=product
	 *
	 * @when after_wp_load
	 */
	public function posts( $args, $assoc_args ) {
		$post_types = isset( $assoc_args['post_type'] )
			? explode( ',', $assoc_args['post_type'] )
			: array( 'post', 'page' );

		WP_CLI::log( 'Scanning posts for types: ' . implode( ', ', $post_types ) );

		foreach ( $post_types as $type ) {
			$posts = get_posts(
				array(
					'post_type'      => $type,
					'post_status'    => 'publish',
					'posts_per_page' => -1,
					'fields'         => 'ids',
				)
			);

			if ( empty( $posts ) ) {
				WP_CLI::log( "No {$type} posts found." );
				continue;
			}

			foreach ( $posts as $post_id ) {
				update_post_meta( $post_id, 'wpmudev_test_last_scan', current_time( 'mysql' ) );
			}

			WP_CLI::success( sprintf( 'Scanned %d %s posts.', count( $posts ), $type ) );
		}

		WP_CLI::success( 'All scans completed successfully!' );
	}
}
