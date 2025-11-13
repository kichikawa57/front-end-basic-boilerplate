<?php $information = get_json_data('data/information.json'); ?>

<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="description" content="<?php echo $information['description']; ?>">
  <meta name="twitter:card" content="<?php echo $information['twitter']['card']; ?>">
  <meta name="twitter:site" content="<?php echo $information['twitter']['site']; ?>">
  <meta name="twitter:creator" content="<?php echo $information['twitter']['creator']; ?>">

  <meta property="og:title" content="<?php echo $information['og']['title']; ?>">
  <meta property="og:type" content="<?php echo $information['og']['type']; ?>">
  <meta property="og:locale" content="<?php echo $information['og']['locale']; ?>">
  <meta property="og:url" content="<?php echo $information['og']['url']; ?>">
  <meta property="og:description" content="<?php echo $information['og']['description']; ?>">
  <meta property="og:image" content="<?php echo get_image_url($information['og']['image']); ?>">

  <link rel="canonical" href="<?php echo $information['canonical']; ?>">
  <link rel="icon" href="<?php echo get_image_url('favicon.ico'); ?>">

  <title><?php echo $information['title']; ?></title>
  <?php wp_head(); ?>
</head>

<body>
  <h1>test</h1>
  <?php wp_footer(); ?>
</body>

</html>