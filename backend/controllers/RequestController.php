<?php

namespace Controllers;

use DateTime;
use Exceptions\ForbiddenHTTPException;
use Models\File;
use Models\Request;
use Models\RequestFile;
use Queues\SendMail;
use Queues\SendMailRaw;
use Queues\SendMessage;

class RequestController extends Controller
{
    /**
     * @var \Models\User
     */
    protected $user;

    public function __construct()
    {
        $this->user = user();
        Request::checkExpired();
    }

    public function index()
    {
        return array_map(function (Request $request) {
            $request->load(['user', 'documentType', 'file', 'tasks', 'files']);
            foreach ($request->files as $file) {
                $file->load(['file']);
            }
            return $request;
        }, Request::getAll());
    }

    public function show()
    {
        $id = input()->id;

        $request = Request::findOrFail($id);

        $request->load(['user', 'documentType', 'file', 'logs', 'tasks', 'files']);

        foreach ($request->files as $file) {
            $file->load(['file']);
        }

        foreach ($request->logs as $log) {
            $log->load(['user']);
        }

        return $request;
    }

    public function store()
    {
        $id = user()->id;
        $documentID = input()->get('document_type_id');

        $pdo = Request::getConnection();

        $query  = 'SELECT COUNT(*) as count FROM ' . (new Request())->getTable() . ' ';
        $query .= 'WHERE user_id = :user_id AND document_type_id = :document_type_id ';
        $query .= 'AND approved = :approved';

        $statement = $pdo->prepare($query);

        $statement->execute([
            ':user_id' => $id,
            ':document_type_id' => $documentID,
            ':approved' => 0,
        ]);

        $row = $statement->fetch();

        if ($row->count > 0) {
            return response(['message' => 'You already have a request for this type of document.'], 403);
        }

        $request = Request::create(input()->except(['user_id']) + ['user_id' => $id]);

        $request->logs()->create(['action' => 'Applicant has issued a request.', 'user_id' => user()->id]);

        $data = [
            'name' => $request->user->name,
            'requestID' => $request->request_id,
            'documentType' => $request->documentType->name,
            'date' => DateTime::createFromFormat('Y-m-d H:i:s', $request->updated_at)->format('F d, Y h:i A'),
        ];

        if (input()->hasFile('files')) {
            foreach (input()->file('files') as $file) {
                $model = File::process($file->fetch(), false);
                $model->name = $file->name;
                $model->save();
                RequestFile::create([
                    'request_id' => $request->id,
                    'file_id' => $model->id,
                ]);
            }
        }

        $request->load(['documentType']);

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

        $data = input()->except(['file_id']);

        if (input()->get('status', $request->status) !== $request->status) {
            $data['acknowledged'] = false;
        }

        $request->fill($data);

        if (input()->hasFile('file')) {
            $raw = input()->file('file');
            $file = File::process($raw->fetch(), false);

            $file->save();

            if ($request->file !== null) {
                $request->file->delete();
            }

            $request->file_id = $file->id;
        }

        if (input()->hasFile('files')) {
            deleteMany($request->files, RequestFile::class);
            foreach (input()->file('files') as $file) {
                $model = File::process($file->fetch(), false);
                $model->save();
                RequestFile::create([
                    'request_id' => $request->id,
                    'file_id' => $file->id,
                ]);
            }
        }

        $request->save();

        $request->logs()->create(['action' => user()->role . ' has updated the request.', 'user_id' => user()->id]);

        $request->load(['file']);

        if (input()->has('email_message')) {
            queue()->register(new SendMailRaw($request->user->email, 'Request Updated', input()->email_message));
        }

        $text  = input()->sms_message;
        $text .= sprintf('%s%s', config('app.frontend.url'), "/dashboard/requests/{$request->id}");

        queue()->register(new SendMessage($request->user->phone, $text));

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

    public function expiring()
    {
        return Request::getExpiring();
    }

    protected function admin()
    {
        if ($this->user->role === 'Student') {
            throw new ForbiddenHTTPException();
        }
    }
}
