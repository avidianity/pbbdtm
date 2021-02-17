<?php

namespace Libraries;

use Exceptions\SemaphoreException;
use GuzzleHttp\Client;

/**
 * Class SemaphoreClient
 * @package Semaphore
 */

class SemaphoreClient
{
    const API_BASE = 'http://beta.semaphore.co/api/v4/';

    public $apikey;
    public $senderName = null;
    protected $client;

    /**
     * SemaphoreClient constructor.
     * @param $apikey
     * @param array $options ( e.g. sendername, apiBase )
     */
    public function __construct($apikey, array $options = [])
    {
        $this->apikey = $apikey;

        $this->senderName = 'SEMAPHORE';
        if (isset($options['sendername'])) {
            $this->senderName = $options['sendername'];
        }

        $apiBase = static::API_BASE;
        if (isset($options['apiBase'])) {
            $apiBase = $options['apiBase'];
        }
        $this->client = new Client(['base_uri' => $apiBase, 'query' => ['apikey' => $this->apikey]]);
    }

    /**
     * Check the balance of your account
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function balance()
    {
        $response = $this->client->get('account');
        return $response->getBody();
    }

    /**
     * Send SMS message(s)
     *
     * @param string $recipient
     * @param string $message - The message you want to send
     * @param string|null $sendername
     * @return \Psr\Http\Message\ResponseInterface
     * @throws \Exceptions\SemaphoreException
     * @internal param $number - The recipient phone number(s)
     * @internal param null $senderId - Optional Sender ID (defaults to initialized value or SEMAPHORE)
     * @internal param bool|false $bulk - Optional send as bulk
     */
    public function send($recipient, $message, $sendername = null)
    {

        $recipients = explode(',', $recipient);
        if (count($recipients) > 1000) {
            throw new SemaphoreException('API is limited to sending to 1000 recipients at a time');
        }

        $params = [
            'form_params' => [
                'apikey' =>  $this->apikey,
                'message' => $message,
                'number' => $recipient,
                'sendername' => $this->senderName
            ]
        ];

        if ($sendername !== null) {
            $params['form_params']['sendername'] = $sendername;
        }

        $response = $this->client->post('messages', $params);

        return $response->getBody();
    }

    /**
     * Retrieves data about a specific message
     *
     * @param $messageId - The encoded ID of the message
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function message($messageId)
    {
        $params = [
            'query' => [
                'apikey' =>  $this->apikey,
            ]
        ];
        $response = $this->client->get('messages/' . $messageId, $params);
        return $response->getBody();
    }

    /**
     * Retrieves up to 100 messages, offset by page
     * @param array $options ( e.g. limit, page, startDate, endDate, status, network, sendername )
     * @return \Psr\Http\Message\ResponseInterface
     * @internal param null $page - Optional page for results past the initial 100
     */
    public function messages($options)
    {

        $params = [
            'query' => [
                'apikey' =>  $this->apikey,
                'limit' => 100,
                'page' => 1
            ]
        ];

        //Set optional parameters
        if (array_key_exists('limit', $options)) {
            $params['query']['limit'] = $options['limit'];
        }

        if (array_key_exists('page', $options)) {
            $params['query']['page'] = $options['page'];
        }

        if (array_key_exists('startDate', $options)) {
            $params['query']['startDate'] = $options['startDate'];
        }

        if (array_key_exists('endDate', $options)) {
            $params['query']['endDate'] = $options['endDate'];
        }

        if (array_key_exists('status', $options)) {
            $params['query']['status'] = $options['status'];
        }

        if (array_key_exists('network', $options)) {
            $params['query']['network'] = $options['network'];
        }

        if (array_key_exists('sendername', $options)) {
            $params['query']['sendername'] = $options['sendername'];
        }

        $response = $this->client->get('messages', $params);
        return $response->getBody();
    }

    /**
     * Get account details
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function account()
    {
        $response = $this->client->get('account');
        return $response->getBody();
    }

    /**
     * Get users associated with the account
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function users()
    {
        $response = $this->client->get('account/users');
        return $response->getBody();
    }

    /**
     * Get sender names associated with the account
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function sendernames()
    {
        $response = $this->client->get('account/sendernames');
        return $response->getBody();
    }

    /**
     * Get transactions associated with the account
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function transactions()
    {
        $response = $this->client->get('account/transactions');
        return $response->getBody();
    }
}
