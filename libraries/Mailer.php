<?php

namespace Libraries;

use Exceptions\MailerException;
use Swift_Mailer;
use Swift_Message;
use Swift_SmtpTransport;
use Traits\Singleton;

class Mailer
{
    use Singleton;

    protected $host;
    protected $username;
    protected $password;
    protected $port;
    protected $body;
    protected $to = '';
    protected $from = '';
    protected $subject = '';

    /**
     * @var \Swift_Mailer|null
     */
    protected $mailer = null;

    public function __construct($host = null, $username = null, $password = null, $port = null)
    {
        $this->host = $host;
        $this->username = $username;
        $this->password = $password;
        $this->port = $port;
        $this->checkCompatibility();
        $this->initCredentials()
            ->initMailer();
    }

    public function setHost($host)
    {
        $this->host = $host;
        return $this;
    }

    public function setUsername($username)
    {
        $this->username = $username;
        return $this;
    }

    public function setPassword($password)
    {
        $this->password = $password;
        return $this;
    }

    public function setBody($body)
    {
        $this->body = $body;
        return $this;
    }

    protected function initCredentials()
    {
        $this->from = config('email.username');
        if (!$this->host) {
            $this->host = config('email.host');
        }
        if (!$this->username) {
            $this->username = config('email.username');
        }
        if (!$this->password) {
            $this->password = config('email.password');
        }
        if (!$this->port) {
            $this->port = config('email.port');
        }
        return $this;
    }

    protected function checkCompatibility()
    {
        $availableTransports = stream_get_transports();

        if (!in_array('tls', $availableTransports)) {
            throw new MailerException('Your current PHP installation does not support \'tls\' encryption as a mailing transport.');
        }

        return $this;
    }

    protected function ready()
    {
        return ($this->mailer instanceof Swift_Mailer) !== false;
    }

    protected function initMailer()
    {
        $transport = new Swift_SmtpTransport($this->host, $this->port, 'tls');

        $transport->setUsername($this->username)
            ->setPassword($this->password);

        $this->mailer = new Swift_Mailer($transport);

        return $this;
    }

    public function setTo($to)
    {
        $this->to = $to;
        return $this;
    }

    public function setSubject($subject)
    {
        $this->subject = $subject;
        return $this;
    }

    public function send($message = null)
    {
        if (!$this->ready()) {
            throw new MailerException('Mailer is not yet ready.');
        }
        if ($message) {
            $this->setBody($message);
        }
        $message = (new Swift_Message($this->subject))
            ->setFrom([$this->from])
            ->setTo([$this->to])
            ->setBody($this->body, 'text/html');

        $i = $this->mailer->send($message);

        $this->to = '';
        $this->body = '';

        return $i !== 0;
    }
}
