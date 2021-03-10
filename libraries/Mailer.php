<?php

namespace Libraries;

use Exception;
use Exceptions\MailerException;
use Models\CMS;
use Swift_Mailer as BaseMailer;
use Swift_Message as Message;
use Swift_SmtpTransport as SMTPTransport;
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
        return $this->mailer instanceof BaseMailer;
    }

    protected function initMailer()
    {
        $transport = new SMTPTransport($this->host, $this->port, 'tls');

        $transport->setUsername($this->username)
            ->setPassword($this->password);

        $this->mailer = new BaseMailer($transport);

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
        $this->body .= "<br />";

        $pdo = CMS::getConnection();

        $table = (new CMS())->getTable();

        $query  = "SELECT * FROM {$table} WHERE {$table}.key = :key LIMIT 1;";

        $statement = $pdo->prepare($query);

        $statement->execute([':key' => 'faqs']);

        if ($statement->rowCount() > 0) {
            $cms = CMS::from($statement->fetch());
            $faqs = (array)json_decode($cms->value);
            $this->body .= "<br />FAQS:<br /><br />";
            foreach ($faqs as $faq) {
                $faq = (array)$faq;
                $this->body .= "{$faq['question']}<br />";
                $this->body .= "{$faq['answer']}<br /><br />";
            }
        }

        $message = (new Message($this->subject))
            ->setFrom([$this->from])
            ->setTo([$this->to])
            ->setBody($this->body, 'text/html');

        try {
            return $this->mailer->send($message) !== 0;
        } catch (Exception $e) {
            Log::record($e);
            return false;
        } finally {
            $this->to = '';
            $this->body = '';
        }
    }

    public function view($path, $data = [])
    {
        if (!View::exists($path)) {
            throw new MailerException($path . ' does not exist on views.');
        }

        $parsed = View::parse($path);

        foreach ($data as $key => $value) {
            $parsed = str_replace('$' . $key, $value, $parsed);
        }

        $this->setBody($parsed);

        return $this;
    }
}
