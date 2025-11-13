<?php

function console_log($data, $label = '') {
  if (is_array($data) || is_object($data)) {
    $output = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  } else {
    $output = $data;
  }

  echo "<script>console.log(" . json_encode($label . ': ') . " + " . json_encode($output) . ");</script>";
}

function get_image_url($url){
  return get_bloginfo('template_directory').'/images/'.$url;
}

function get_json_data($relative_path) {
  $json_path = get_template_directory() . '/' . ltrim($relative_path, '/');

  if (!file_exists($json_path)) {
    return null; // ファイルが無ければ null を返す
  }

  $json_data = file_get_contents($json_path);
  $parsed = json_decode($json_data, true);

  return $parsed !== null ? $parsed : null;
}