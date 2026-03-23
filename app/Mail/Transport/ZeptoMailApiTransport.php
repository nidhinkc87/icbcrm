<?php

declare(strict_types=1);

namespace App\Mail\Transport;

use LogicException;
use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\Exception\HttpTransportException;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractApiTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface as HttpClientTransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

final class ZeptoMailApiTransport extends AbstractApiTransport
{
    private const HOST = 'api.zeptomail.in';

    private const API_PATH = '/v1.1/email';

    private const SUCCESS_STATUS_CODE = 201;

    private string $key;

    private string $endpoint;

    public function __construct(
        string $key,
        ?string $region = null,
        ?HttpClientInterface $client = null,
        ?EventDispatcherInterface $dispatcher = null,
        ?LoggerInterface $logger = null
    ) {
        $this->key = $key;
        $this->endpoint = $this->buildEndpoint($region);

        parent::__construct($client, $dispatcher, $logger);
    }

    public function __toString(): string
    {
        return sprintf('zeptomail+api://%s', parse_url($this->endpoint, PHP_URL_HOST) ?? self::HOST);
    }

    protected function doSendApi(SentMessage $sentMessage, Email $email, Envelope $envelope): ResponseInterface
    {
        $this->getLogger()->debug(sprintf('Sending email via ZeptoMail API to %s', $this->endpoint));

        $response = $this->client->request('POST', $this->endpoint, [
            'headers' => $this->getHeaders(),
            'json' => $this->getPayload($email, $envelope),
        ]);

        try {
            $statusCode = $response->getStatusCode();
            $result = $response->toArray(false);

            $this->getLogger()->debug('ZeptoMail API response received', [
                'status' => $statusCode,
                'body' => $result,
            ]);

            $this->handleResponse($statusCode, $result, $response, $sentMessage);

            return $response;
        } catch (DecodingExceptionInterface $e) {
            $this->getLogger()->error('ZeptoMail API response decoding failed.', ['error' => $e->getMessage()]);
            throw new HttpTransportException('Could not decode ZeptoMail API response: ', $response, 0, $e);
        } catch (HttpClientTransportExceptionInterface|ClientExceptionInterface|RedirectionExceptionInterface|ServerExceptionInterface $e) {
            $this->getLogger()->error('ZeptoMail API connection error.', ['error' => $e->getMessage()]);
            throw new TransportException('Could not reach ZeptoMail API endpoint: '.$e->getMessage(), $e->getCode(), $e);
        }
    }

    private function buildEndpoint(?string $region): string
    {
        $host = self::HOST;
        if ($region && ! in_array($region, ['com', 'us'], true)) {
            $host = str_replace('.in', '.'.$region, self::HOST);
        }

        return 'https://'.$host.self::API_PATH;
    }

    private function getHeaders(): array
    {
        return [
            'Authorization' => 'Zoho-enczapikey '.$this->key,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    private function handleResponse(int $statusCode, array $result, ResponseInterface $response, SentMessage $sentMessage): void
    {
        if ($statusCode !== self::SUCCESS_STATUS_CODE) {
            $errorMessage = $result['error']['details'] ?? $result['error']['message'] ?? ('HTTP Status '.$statusCode);
            $errorCode = $result['error']['code'] ?? $statusCode;

            $this->getLogger()->error('ZeptoMail API returned an error.', [
                'status' => $statusCode,
                'code' => $errorCode,
                'message' => $errorMessage,
                'response_body' => $result,
            ]);

            throw new HttpTransportException(
                sprintf('Unable to send email via ZeptoMail: %s (Code %s)', $errorMessage, $errorCode),
                $response
            );
        }

        if (isset($result['data']['message_id'])) {
            $sentMessage->setMessageId($result['data']['message_id']);
        }
    }

    private function getPayload(Email $email, Envelope $envelope): array
    {
        $payload = [
            'from' => $this->formatAddress($envelope->getSender()),
            'to' => array_map(fn (Address $address) => ['email_address' => $this->formatAddress($address)], $this->getRecipients($email, $envelope)),
            'subject' => $email->getSubject(),
        ];

        if ($cc = $email->getCc()) {
            $payload['cc'] = array_map(fn (Address $address) => ['email_address' => $this->formatAddress($address)], $cc);
        }

        if ($bcc = $email->getBcc()) {
            $payload['bcc'] = array_map(fn (Address $address) => ['email_address' => $this->formatAddress($address)], $bcc);
        }

        if ($replyTo = $email->getReplyTo()) {
            $payload['reply_to'] = array_map(fn (Address $address) => $this->formatAddress($address), $replyTo);
        }

        $this->addMessageContent($payload, $email);

        return $payload;
    }

    private function formatAddress(Address $address): array
    {
        $data = ['address' => $address->getAddress()];
        if ($name = $address->getName()) {
            $data['name'] = $name;
        }

        return $data;
    }

    private function addMessageContent(array &$payload, Email $email): void
    {
        if ($textBody = $email->getTextBody()) {
            $payload['textbody'] = $textBody;
        }

        if ($htmlBody = $email->getHtmlBody()) {
            $payload['htmlbody'] = $htmlBody;
        }

        if (empty($payload['textbody']) && empty($payload['htmlbody'])) {
            throw new LogicException('Email must have either a text or HTML body to be sent via ZeptoMail.');
        }
    }
}
