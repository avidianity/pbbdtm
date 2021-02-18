<?php

namespace Controllers;

use DateTime;
use Exceptions\ForbiddenHTTPException;
use Models\File;
use Models\Request;
use Queues\SendMail;
use Queues\SendMessage;

class RequestController extends Controller
{
    /**
     * @var \Models\User
     */
    protected $user;

    public function __construct()
    {
        auth();
        $this->user = user();
        Request::checkExpired();
    }

    public function index()
    {
        return array_map(function (Request $request) {
            return $request->load(['user', 'documentType', 'file']);
        }, Request::getAll());
    }

    public function show()
    {
        $id = input()->id;

        $request = Request::findOrFail($id);

        $request->load(['user', 'documentType', 'file', 'logs']);

        foreach ($request->logs as $log) {
            $log->load(['user']);
        }

        return $request;
    }

    public function store()
    {
        $request = Request::create(input()->except(['user_id']) + ['user_id' => user()->id]);

        $request->logs()->create(['action' => 'Applicant has issued a request.', 'user_id' => user()->id]);

        $data = [
            'name' => $request->user->name,
            'requestID' => $request->request_id,
            'documentType' => $request->documentType->name,
            'date' => DateTime::createFromFormat('Y-m-d H:i:s', $request->updated_at)->format('F d, Y h:i A'),
        ];

        queue()->register(new SendMail(user()->email, 'emails.new-request', 'Request Creation', $data));

        $message = 'Hi! This is a message from PBBDTM. You have made a request (ID: ' . $request->request_id . '). We will notify you on further updates.';
        $phone = user()->phone;

        queue()->register(new SendMessage($phone, $message));

        return $request;
    }

    public function update()
    {
        $this->admin();
        $id = input()->once('id');

        $request = Request::findOrFail($id);

        $data = input()->all();

        if (input()->get('status', $request->status) !== $request->status) {
            $data['acknowledged'] = false;
        }

        if (input()->has('file')) {
            $raw = input()->file;
            $file = File::process($raw);

            $file->save();

            if ($request->file !== null) {
                $request->file->delete();
            }

            $request->file_id = $file->id;
        }

        $request->update($data);

        $request->logs()->create(['action' => user()->role . ' has updated the request.', 'user_id' => user()->id]);

        $request->load(['file']);

        return $request;
    }

    public function destroy()
    {
        $this->admin();
        $id = input()->once('id');

        $request = Request::findOrFail($id);

        $request->delete();

        return response('', 204);
    }

    protected function admin()
    {
        if ($this->user->role === 'Student') {
            throw new ForbiddenHTTPException();
        }
    }
}
