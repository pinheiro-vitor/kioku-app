<?php
$options = [
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n"
    ]
];
$context = stream_context_create($options);
echo "Attempting to fetch https://sakuramangas.org/feed...\n";
$content = @file_get_contents('https://sakuramangas.org/feed', false, $context);

if ($content === FALSE) {
    echo "Failed to fetch feed. Error details:\n";
    print_r(error_get_last());
} else {
    echo "Success! Feed found.\n";
    echo "Length: " . strlen($content) . " bytes\n";
    echo "First 200 chars:\n" . substr($content, 0, 200) . "\n";
}
