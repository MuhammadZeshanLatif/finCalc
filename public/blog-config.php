<?php
// Public read-only settings for blog-router.php and sitemap.php.
// The publishable (anon) key is browser-safe: Row Level Security only exposes published, due posts.
return [
  'origin' => 'https://financcalculators.com',
  'siteName' => 'FinanceCalculator',
  'supabaseUrl' => 'https://ehnpcdnkagkmgmtopwkx.supabase.co',
  'anonKey' => '%%VITE_SUPABASE_ANON_KEY%%',
  'table' => 'fincalc_blog_posts',
];
