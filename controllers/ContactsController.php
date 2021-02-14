<?php

namespace Controllers;

use Models\Contact;
use Models\User;

class ContactsController extends Controller
{
    public function index()
    {
        auth(function (User $user) {
            return $user->isAdmin();
        });
        return Contact::getAll();
    }

    public function show()
    {
        $id = input()->once('id');

        return Contact::findOrFail($id);
    }

    public function store()
    {
        return Contact::create(input()->only(['name', 'email', 'message']));
    }

    public function update()
    {
        return response('', 404);
    }

    public function destroy()
    {
        $id = input()->once('id');

        $contact = Contact::findOrFail($id);

        $contact->delete();

        return response('', 204);
    }
}
