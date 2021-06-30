<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DTMS</title>
</head>

<body>
    <h1>Error</h1>
    <p><?= $exception->getMessage() ?></p>
    <?php if (config('app.debug')) : ?>
        <hr />
        <h5>Trace:</h5>
        <?php foreach ($exception->getTrace() as $trace) : ?>
            <h6>File</h6>
            <p><?= $trace['file'] ?></p>
            <h6>Line</h6>
            <p><?= $trace['line'] ?></p>
            <h6>Function</h6>
            <p><?= $trace['function'] ?></p>
            <hr />
        <?php endforeach; ?>
    <?php endif; ?>
</body>

</html>