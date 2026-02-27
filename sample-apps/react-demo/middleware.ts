import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Query param shown when create-user API fails; middleware serves the error page. */
const CREATE_USER_ERROR_PARAM = 'create_user_error';

/**
 * Error page shown when create-user fails. Instructs the user to reload.
 */
function createUserErrorPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Something went wrong – Stream Feeds</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      font-family: system-ui, -apple-system, sans-serif;
      background: #fff;
      color: #1a1a1a;
      padding: 1rem;
    }
    .message { font-size: 1rem; color: #374151; text-align: center; max-width: 24rem; }
    .reload {
      display: inline-block;
      padding: 0.5rem 1rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #fff;
      background: oklch(62% 0.19 245);
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      text-decoration: none;
    }
    .reload:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <p class="message">Something went wrong while setting up your demo session. Please reload the page to try again.</p>
  <button type="button" class="reload" onclick="location.replace(location.pathname);">Reload page</button>
</body>
</html>`;
}

/**
 * When user_id is not in the URL, return a loading page that calls create-user
 * on the client and then redirects. This shows a loading indicator while
 * create-user runs instead of a blank browser tab.
 */
function loadingPageHtml(redirectPath: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Loading – Stream Feeds</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      font-family: system-ui, -apple-system, sans-serif;
      background: #fff;
      color: #1a1a1a;
    }
    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #e5e7eb;
      border-top-color: oklch(62% 0.19 245);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .text { font-size: 0.9375rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="spinner" aria-hidden="true"></div>
  <p class="text">Generating demo user and activities...</p>
  <script>
    (function() {
      var path = ${JSON.stringify(redirectPath)};
      fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(r); })
        .then(function(data) {
          var uid = data && data.userId && data.userId.trim();
          if (!uid) return Promise.reject();
          var url = new URL(path, location.origin);
          url.searchParams.set('user_id', uid);
          location.replace(url.pathname + url.search);
        })
        .catch(function() {
          var sep = path.indexOf('?') >= 0 ? '&' : '?';
          location.replace(path + sep + '${CREATE_USER_ERROR_PARAM}=1');
        });
    })();
  </script>
</body>
</html>`;
}

export async function middleware(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id');
  if (userId?.trim()) {
    return NextResponse.next();
  }

  const createUserError = request.nextUrl.searchParams.get(CREATE_USER_ERROR_PARAM);
  if (createUserError) {
    const html = createUserErrorPageHtml();
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  const path = request.nextUrl.pathname + request.nextUrl.search;
  const html = loadingPageHtml(path);
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static files and API routes.
     * Skip /api so we don't call create-user from within the API.
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
