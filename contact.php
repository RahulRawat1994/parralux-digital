<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store');
function finish(int $code, string $message): void {
    http_response_code($code);
    $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Contact | ParRaLux Digital</title><link rel="stylesheet" href="css/bootstrap.min.css"></head><body><main class="container py-5"><h1>Contact ParRaLux Digital</h1><p>' . $safe . '</p><a href="contact.html">Return to the contact form</a></main></body></html>';
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    finish(405, 'Please submit your message using the contact form.');
}
$values = [];
foreach (['name' => 120, 'email' => 254, 'subject' => 200, 'message' => 5000] as $key => $limit) {
    $value = $_POST[$key] ?? null;
    if (!is_string($value) || trim($value) === '' || preg_match('//u', $value) !== 1 || preg_match_all('/./us', $value) > $limit) {
        finish(422, 'Please complete every field within the indicated limits. Use your browser’s Back button to edit your message.');
    }
    $values[$key] = trim($value);
}
if (!filter_var($values['email'], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $values['email'] . $values['subject'] . $values['name'])) {
    finish(422, 'Please provide a valid email and single-line name and subject.');
}
$to = getenv('PARRALUX_CONTACT_TO');
$from = getenv('PARRALUX_CONTACT_FROM');
foreach ([$to, $from] as $address) {
    if (!$address || !filter_var($address, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $address)) {
        finish(503, 'Message delivery is not configured yet. Your message has not been sent.');
    }
}
$body = "Name: {$values['name']}\nEmail: {$values['email']}\nSubject: {$values['subject']}\n\n{$values['message']}";
$sent = mail($to, 'ParRaLux Digital website enquiry', $body, [
    'From' => $from,
    'Reply-To' => $values['email'],
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8'
]);
if (!$sent) finish(503, 'Your message could not be sent. Please try again later.');
finish(200, 'Thank you. Your message has been accepted for delivery.');
