<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/bootstrap.php';

class WPMUDEV_GoogleDrive_Test extends TestCase {

	public function test_gdrive_token_option() {
		update_option( 'wpmudev_gdrive_token', 'dummy-token' );
		$token = get_option( 'wpmudev_gdrive_token' );
		$this->assertEquals( 'dummy-token', $token );
		delete_option( 'wpmudev_gdrive_token' );
	}

	public function test_admin_page_registered() {
		global $menu;
		$page_found = false;
		foreach ( $menu as $menu_item ) {
			if ( isset( $menu_item[2] ) && $menu_item[2] === 'wpmudev-plugin-test-googledrive' ) {
				$page_found = true;
				break;
			}
		}
		$this->assertTrue( $page_found );
	}
}
