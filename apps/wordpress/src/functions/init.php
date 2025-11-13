<?php
  function add_css_js() {
    // テーマのCSS
    wp_enqueue_style('style_front', get_template_directory_uri().'/style/index.css' );

    // テーマ全体のCSS
    wp_enqueue_style('style', get_template_directory_uri().'/style.css' );

    // 依存関係のJS
    wp_enqueue_script('shared', get_template_directory_uri().'/shared/script/vendor.js');

    // テーマのJS
    wp_enqueue_script('main', get_template_directory_uri().'/script/index.js');
  };

  add_action('wp_enqueue_scripts', 'add_css_js');