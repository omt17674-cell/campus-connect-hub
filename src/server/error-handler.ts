export default function errorHandler(error: any, _event: any) {
  const message = error?.message || String(error);
  const stack = error?.stack || null;
  const cause = error?.cause ? String(error.cause) : null;

  return new Response(
    JSON.stringify(
      {
        nitroCustomError: true,
        message,
        stack,
        cause,
      },
      null,
      2,
    ),
    {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}
