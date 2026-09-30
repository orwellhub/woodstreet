<?php
// Tests for lead.php. Run: php lead.test.php [path/to/lead.php]. No mail is sent.
declare(strict_types=1);
require $argv[1] ?? __DIR__ . '/../lead.php';

$fails = 0;
function t(bool $c, string $m): void { global $fails; if (!$c) { $fails++; fwrite(STDERR, "FAIL: $m\n"); } }

$tmp = sys_get_temp_dir() . '/lead-test-' . bin2hex(random_bytes(4));
mkdir($tmp . '/public_html', 0700, true);
$cfg = array_merge(lead_config(), ['log_key' => 'test', 'to' => ['a@example.com', 'b@example.com'], 'from' => 'noreply@example.org', 'brand' => 'Test Site', 'thank_you' => '/thanks.html', 'sites' => [], 'allowed_origins' => []]);
$srv = ['REQUEST_METHOD' => 'POST', 'HTTP_ACCEPT' => 'application/json', 'HTTP_HOST' => 'example.org', 'DOCUMENT_ROOT' => $tmp . '/public_html'];
$_SERVER['DOCUMENT_ROOT'] = $tmp . '/public_html';
$ip = static fn() => '203.0.113.' . random_int(1, 254);
$good = ['name' => 'Test User', 'email' => 'test@example.com', 'phone' => '+971500000000', 'message' => "Hello\nThere", '_honey' => '', '_next' => 'x'];
$sent = [];
$ok = static function ($to, $s, $b, $h, $e) use (&$sent) { $sent[] = compact('to', 's', 'b', 'h', 'e'); return true; };

// Happy path, form-encoded
$r = lead_handle($srv + ['REMOTE_ADDR' => $ip()], $good, '', $ok, $cfg);
t($r['code'] === 200 && $r['body']['ok'] === true && count($sent) === 1, 'good lead accepted and sent once');
t($sent[0]['to'] === 'a@example.com, b@example.com', 'sent to every configured recipient');
t(strpos($sent[0]['h'], '<noreply@example.org>') !== false && strpos($sent[0]['h'], 'Reply-To: ') !== false && strpos($sent[0]['h'], '<test@example.com>') !== false, 'From on the site domain, Reply-To the enquirer');
t(strpos($sent[0]['b'], "Message:\nHello\nThere") !== false && strpos($sent[0]['b'], '_next') === false && strpos($sent[0]['b'], 'Name: Test User') !== false, 'body lists fields, skips underscore fields');
t($sent[0]['e'] === 'noreply@example.org', 'envelope sender');
t(is_dir($tmp . '/test-leads') && glob($tmp . '/test-leads/leads-*.jsonl'), 'lead logged above the web root');
// JSON body
$r = lead_handle($srv + ['REMOTE_ADDR' => $ip(), 'CONTENT_TYPE' => 'application/json'], [], json_encode(['full_name' => 'J Son', 'email' => 'j@example.com', 'service' => 'Quote']), $ok, $cfg);
t($r['code'] === 200 && strpos(mb_decode_mimeheader($sent[1]['s']), '[Test Site enquiry] Quote | J Son') !== false, 'JSON bodies accepted; subject names service and person');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip(), 'CONTENT_TYPE' => 'application/json'], [], '{bad', $ok, $cfg)['code'] === 422, 'malformed JSON rejected');
// Healthcheck tag
lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['name' => 'HEALTHCHECK-2026-10-01', 'email' => 'x@example.com'], '', $ok, $cfg);
t(strpos(mb_decode_mimeheader(end($sent)['s']), '[HEALTHCHECK]') !== false, 'health checks tagged');
// Honeypot
$n = count($sent);
$r = lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['_honey' => 'bot'] + $good, '', $ok, $cfg);
t($r['code'] === 200 && count($sent) === $n, 'honeypot: silent success, nothing sent');
// Validation
t(lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['name' => 'X', 'email' => 'nope'], '', $ok, $cfg)['code'] === 422, 'bad email rejected');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['name' => 'X'], '', $ok, $cfg)['code'] === 422, 'no email or phone rejected');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['name' => 'X', 'phone' => '0501234567'], '', $ok, $cfg)['code'] === 200, 'phone-only lead accepted');
$inj = lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['name' => "Eve\r\nBcc: v@example.com", 'email' => 'e@example.com'], '', $ok, $cfg);
t($inj['code'] === 200 && substr_count(end($sent)['h'], "\r\n") === 5 && !preg_match('/^Bcc:/mi', end($sent)['h']) && strpos(end($sent)['h'], 'Reply-To: "Eve Bcc: v@example.com" <e@example.com>') !== false, 'no header injection through the name');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip()], ['name' => 'X', 'email' => "a@example.com\r\nBcc: v@example.com"], '', $ok, $cfg)['code'] === 422, 'no header injection through the email');
// Methods and origins
t(lead_handle(['REQUEST_METHOD' => 'GET'] + $srv, [], '', $ok, $cfg)['code'] === 405, 'GET refused');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip(), 'HTTP_ORIGIN' => 'https://evil.example'], $good, '', $ok, $cfg)['code'] === 403, 'foreign origin refused');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip(), 'HTTP_ORIGIN' => 'https://example.org'], $good, '', $ok, $cfg)['code'] === 200, 'same origin allowed');
// Failures
t(lead_handle($srv + ['REMOTE_ADDR' => $ip()], $good, '', static fn() => false, $cfg)['code'] === 502, 'mail() false is a 502, never success');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip()], $good, '', static function () { throw new RuntimeException('x'); }, $cfg)['code'] === 502, 'sender exception is a 502');
// No-JS redirect
$r = lead_handle(['HTTP_ACCEPT' => 'text/html'] + $srv + ['REMOTE_ADDR' => $ip()], $good, '', $ok, $cfg);
t($r['json'] === false && $r['redirect'] === '/thanks.html', 'no-JS post redirects to the thank-you page');
// Relay mode
$relay = array_merge($cfg, ['allowed_origins' => ['https://orwelllab.com'], 'sites' => ['orwelllab' => ['brand' => 'Orwell Lab', 'thank_you' => 'https://orwelllab.com/contact/?sent=1']]]);
$r = lead_handle($srv + ['REMOTE_ADDR' => $ip(), 'HTTP_ORIGIN' => 'https://orwelllab.com'], ['_site' => 'orwelllab'] + $good, '', $ok, $relay);
t($r['code'] === 200 && $r['cors'] === 'https://orwelllab.com' && strpos(mb_decode_mimeheader(end($sent)['s']), '[Orwell Lab enquiry]') !== false, 'relay: allowed origin, brand from the site key, CORS header');
t(lead_handle(['REQUEST_METHOD' => 'OPTIONS'] + $srv + ['HTTP_ORIGIN' => 'https://orwelllab.com'], [], '', $ok, $relay)['code'] === 204, 'relay: preflight answered');
t(lead_handle($srv + ['REMOTE_ADDR' => $ip(), 'HTTP_ORIGIN' => 'https://orwelllab.com'], ['_site' => 'nope'] + $good, '', $ok, $relay)['code'] === 422, 'relay: unknown site refused');
// Rate limit
$d = $tmp . '/rl';
mkdir($d);
for ($i = 0; $i < 5; $i++) { t(lead_rate_ok($d, '192.0.2.1', 5, 900, 1000 + $i), "rate hit $i"); }
t(!lead_rate_ok($d, '192.0.2.1', 5, 900, 1010), 'sixth hit refused');
t(lead_rate_ok($d, '192.0.2.1', 5, 900, 3000), 'allowed after the window');

if ($fails) { fwrite(STDERR, "$fails lead.php check(s) failed\n"); exit(1); }
echo "PASS: lead.php: delivery, recipients, headers, JSON and form bodies, honeypot, validation, origins, failures, redirects, relay and rate limit (no mail sent).\n";
