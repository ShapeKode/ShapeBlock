<?php
namespace ShapeBlock\Extension\ThemeBuilder;

/**
 * Theme Builder — display conditions.
 *
 * Owns the catalog of available condition rules and the engine that decides,
 * for the current request, whether a given conditions set should display.
 *
 * Conditions are stored as a flat list of rows:
 *
 *     array(
 *         array( 'type' => 'include', 'rule' => 'entire_site', 'ids' => array() ),
 *         array( 'type' => 'exclude', 'rule' => 'page',        'ids' => array( 42 ) ),
 *     )
 *
 * Display logic: an item shows when at least one INCLUDE row matches the
 * request and no EXCLUDE row matches (exclude always wins). Without an
 * INCLUDE row it shows nowhere: removing "Entire Site" hides the template.
 * A new template starts with "Entire Site" (Builder_API::create_item()).
 *
 * @package ShapeBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Builder_Conditions {

	/**
	 * Catalog of selectable rules, grouped for the UI.
	 *
	 * `needsObject` rules require the user to pick one or more objects (ids);
	 * `objectType` tells the UI which list endpoint to load.
	 *
	 * @return array<string,array<string,array<string,mixed>>>
	 */
	public static function get_rules() {
		$rules = array(
			'general'  => array(
				'entire_site'  => array( 'label' => __( 'Entire Site', 'shapeblock' ), 'needsObject' => false ),
				'front_page'   => array( 'label' => __( 'Front Page', 'shapeblock' ), 'needsObject' => false ),
				'all_pages'    => array( 'label' => __( 'All Pages', 'shapeblock' ), 'needsObject' => false ),
				'all_posts'    => array( 'label' => __( 'All Posts', 'shapeblock' ), 'needsObject' => false ),
				'all_archives' => array( 'label' => __( 'All Archives', 'shapeblock' ), 'needsObject' => false ),
				'search'       => array( 'label' => __( 'Search Results', 'shapeblock' ), 'needsObject' => false ),
				'not_found'    => array( 'label' => __( '404 Page', 'shapeblock' ), 'needsObject' => false ),
			),
			'specific' => array(
				'page' => array( 'label' => __( 'Specific Pages', 'shapeblock' ), 'needsObject' => true, 'objectType' => 'page' ),
				'post' => array( 'label' => __( 'Specific Posts', 'shapeblock' ), 'needsObject' => true, 'objectType' => 'post' ),
			),
		);

		/**
		 * Filter the catalog of Theme Builder condition rules.
		 *
		 * @param array $rules Grouped rule definitions.
		 */
		return apply_filters( 'shapeblock_builder_condition_rules', $rules );
	}

	/**
	 * Flat lookup: rule slug => definition. Used for validation and matching.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function get_rules_flat() {
		$flat = array();
		foreach ( self::get_rules() as $group ) {
			foreach ( $group as $slug => $def ) {
				$flat[ $slug ] = $def;
			}
		}
		return $flat;
	}

	/**
	 * Validate + normalise a raw conditions payload before persisting.
	 *
	 * @param mixed $raw Untrusted input.
	 * @return array<int,array<string,mixed>>
	 */
	public static function sanitize( $raw ) {
		if ( ! is_array( $raw ) ) {
			return array();
		}

		$valid_rules = self::get_rules_flat();
		$clean       = array();

		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) || empty( $row['rule'] ) ) {
				continue;
			}

			$rule = sanitize_key( $row['rule'] );
			if ( ! isset( $valid_rules[ $rule ] ) ) {
				continue;
			}

			$type = isset( $row['type'] ) && 'exclude' === $row['type'] ? 'exclude' : 'include';

			$ids = array();
			if ( ! empty( $valid_rules[ $rule ]['needsObject'] ) && isset( $row['ids'] ) && is_array( $row['ids'] ) ) {
				foreach ( $row['ids'] as $id ) {
					$id = (int) $id;
					if ( $id > 0 ) {
						$ids[] = $id;
					}
				}
				$ids = array_values( array_unique( $ids ) );

				// An object rule with no objects selected is meaningless — skip it.
				if ( empty( $ids ) ) {
					continue;
				}
			}

			$clean[] = array(
				'type' => $type,
				'rule' => $rule,
				'ids'  => $ids,
			);
		}

		return $clean;
	}

	/**
	 * Decide whether a conditions set should display on the current request.
	 *
	 * @param array $conditions Sanitised conditions list.
	 */
	public static function matches_current_request( $conditions ) {
		return self::match_rank( $conditions ) > 0;
	}

	/**
	 * How closely a conditions set fits the current request: 0 when it does not
	 * display here, else the rank of its most specific matching INCLUDE row
	 * (see rule_rank()). When several templates of one type display on a page,
	 * the most specific one is used, so a Front Page header keeps the front
	 * page even after an Entire Site header is edited later.
	 *
	 * @param array $conditions Sanitised conditions list.
	 * @return int
	 */
	public static function match_rank( $conditions ) {
		if ( ! is_array( $conditions ) || empty( $conditions ) ) {
			// No conditions: the template is shown nowhere.
			return 0;
		}

		$rank = 0;

		foreach ( $conditions as $row ) {
			$rule = isset( $row['rule'] ) ? $row['rule'] : '';
			$ids  = isset( $row['ids'] ) && is_array( $row['ids'] ) ? $row['ids'] : array();
			$type = isset( $row['type'] ) ? $row['type'] : 'include';

			if ( ! self::rule_matches_request( $rule, $ids ) ) {
				continue;
			}
			if ( 'exclude' === $type ) {
				return 0; // Exclude always wins.
			}
			$rank = max( $rank, self::rule_rank( $rule ) );
		}

		// Only exclude rows (or none matching): shown nowhere.
		return $rank;
	}

	/**
	 * How specific a rule is: chosen pages or posts (4) over a single kind of
	 * page such as the front page or category pages (3), over a whole group
	 * such as all pages or all archives (2), over the entire site (1).
	 *
	 * @param string $rule Rule slug.
	 * @return int
	 */
	protected static function rule_rank( $rule ) {
		if ( 'entire_site' === $rule ) {
			return 1;
		}
		$flat = self::get_rules_flat();
		if ( ! empty( $flat[ $rule ]['needsObject'] ) ) {
			return 4;
		}
		return 0 === strpos( $rule, 'all_' ) ? 2 : 3;
	}

	/**
	 * Whether a single rule applies to the current request.
	 *
	 * @param string     $rule Rule slug.
	 * @param array<int> $ids  Object ids for object-bound rules.
	 */
	protected static function rule_matches_request( $rule, $ids ) {
		switch ( $rule ) {
			case 'entire_site':
				return true;

			case 'front_page':
				return is_front_page();

			case 'all_pages':
				return is_page();

			case 'all_posts':
				return is_singular( 'post' );

			case 'all_archives':
				return is_archive() || is_home();

			case 'search':
				return is_search();

			case 'not_found':
				return is_404();

			case 'page':
				return is_page() && in_array( (int) get_queried_object_id(), array_map( 'intval', $ids ), true );

			case 'post':
				return is_singular( 'post' ) && in_array( (int) get_queried_object_id(), array_map( 'intval', $ids ), true );
		}

		/**
		 * Allow custom rules (future template types) to resolve matching.
		 *
		 * @param bool   $matches Default false.
		 * @param string $rule    Rule slug.
		 * @param array  $ids     Object ids.
		 */
		return apply_filters( 'shapeblock_builder_rule_matches_request', false, $rule, $ids );
	}

	/**
	 * Build a short human summary of a conditions set (for the dashboard table).
	 */
	public static function summarize( $conditions ) {
		if ( ! is_array( $conditions ) || empty( $conditions ) ) {
			return __( 'Not shown anywhere', 'shapeblock' );
		}

		$flat  = self::get_rules_flat();
		$parts = array();

		foreach ( $conditions as $row ) {
			$rule  = isset( $row['rule'] ) ? $row['rule'] : '';
			$label = isset( $flat[ $rule ]['label'] ) ? $flat[ $rule ]['label'] : $rule;
			$type  = isset( $row['type'] ) && 'exclude' === $row['type'] ? '−' : '+';

			$count = ! empty( $row['ids'] ) ? ' (' . count( $row['ids'] ) . ')' : '';
			$parts[] = $type . ' ' . $label . $count;
		}

		return implode( ', ', $parts );
	}
}
