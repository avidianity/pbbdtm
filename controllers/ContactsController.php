<?php

namespace Controllers;

use Models\Contact;
use Models\User;

/**
 * Responsible for handling users that sends a message from the landing page
 */
class ContactsController extends Controller
{
    /**
     * Get all records
     *
     * @return \Models\Contact[]
     * @throws \Exceptions\ForbiddenHTTPException if the request is not authenticated or the user is not an admin
     */
    public function index()
    {
        auth(function (User $user) {
            return $user->isAdmin();
        });
        return Contact::getAll();
    }

    /**
     * Get one record
     *
     * @return \Models\Contact
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function show()
    {
        $id = input()->once('id');

        return Contact::findOrFail($id);
    }

    /**
     * Store a record
     *
     * @return \Models\Contact
     */
    public function store()
    {
        return Contact::create(input()->only(['name', 'email', 'message']));
    }

    /**
     * Update a record
     *
     * @return \Models\Contact
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function update()
    {
        return response('', 404);
    }

    /**
     * Delete a record
     *
     * @return \Libraries\Response
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function destroy()
    {
        $id = input()->once('id');

        $contact = Contact::findOrFail($id);

        $contact->delete();

        return response('', 204);
    }
}
