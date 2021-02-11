<?php

namespace Controllers;

use Exceptions\ForbiddenHTTPException;
use Models\File;
use Models\Request;

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
        $request = Request::create(input()->all());

        $request->logs()->create(['action' => 'Applicant has issued a request.', 'user_id' => user()->id]);

        return $request;
    }

    public function update()
    {
        $this->admin();
        $id = input()->once('id');

        $request = Request::findOrFail($id);

        if (input()->has('file')) {
            $raw = input()->file;
            $file = File::process($raw);

            $file->save();

            if ($request->file !== null) {
                $request->file->delete();
            }

            $request->file_id = $file->id;
        }

        $request->update(input()->all());

        $request->logs()->create(['action' => user()->role . ' has updated the request.', 'user_id' => user()->id]);

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
