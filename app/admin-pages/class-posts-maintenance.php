<?php
/**
 * Posts Maintenance admin page.
 *
 * @link    https://wpmudev.com/
 * @since   1.0.0
 *
 * @package WPMUDEV\PluginTest
 */

namespace WPMUDEV\PluginTest\App\Admin_Pages;

defined( 'WPINC' ) || die;

use WPMUDEV\PluginTest\Base;

class Posts_Maintenance extends Base {

	/**
	 * Page slug.
	 *
	 * @var string
	 */
	private $page_slug = 'wpmudev_plugintest_posts';

	/**
	 * Page title.
	 *
	 * @var string
	 */
	private $page_title = 'Posts Maintenance';

	/**
	 * Initialize hooks.
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'register_admin_page' ) );
	}

	/**
	 * Register submenu under Drive Test.
	 */
	public function register_admin_page() {
		add_submenu_page(
			'wpmudev_plugintest_drive', // parent slug
			__( 'Posts Maintenance', 'wpmudev-plugin-test' ),
			__( 'Posts Maintenance', 'wpmudev-plugin-test' ),
			'manage_options',
			$this->page_slug,
			array( $this, 'callback' )
		);
	}

	/**
	 * Render page content.
	 */
	public function callback() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'wpmudev-plugin-test' ) );
		}

		echo '<div class="wrap sui-wrap">';
		echo '<h1>' . esc_html__( 'Posts Maintenance', 'wpmudev-plugin-test' ) . '</h1>';

		$posts = get_posts(
			array(
				'numberposts' => 10,
				'post_type'   => 'post',
				'post_status' => 'any',
			)
		);

		if ( empty( $posts ) ) {
			echo '<p>' . esc_html__( 'No posts found.', 'wpmudev-plugin-test' ) . '</p>';
		} else {
			echo '<table class="widefat fixed striped">';
			echo '<thead><tr><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>';
			echo '<tbody>';

			foreach ( $posts as $post ) {
				echo '<tr>';
				echo '<td>' . esc_html( $post->post_title ) . '</td>';
				echo '<td>' . esc_html( $post->post_status ) . '</td>';
				echo '<td>' . esc_html( $post->post_date ) . '</td>';
				echo '<td>';
				echo '<a href="' . esc_url( get_edit_post_link( $post->ID ) ) . '" class="button button-small">' . esc_html__( 'Edit', 'wpmudev-plugin-test' ) . '</a> ';
				echo '<a href="#" class="button button-small button-secondary">' . esc_html__( 'Delete', 'wpmudev-plugin-test' ) . '</a>';
				echo '</td>';
				echo '</tr>';
			}

			echo '</tbody></table>';
		}

		echo '</div>';
	}
}
