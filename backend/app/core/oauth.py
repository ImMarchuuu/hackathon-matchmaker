from authlib.integrations.starlette_client import OAuth

from app.core.config import settings

oauth = OAuth()

# ── Google ────────────────────────────────────────────────────────────────────
# Hardcoded endpoints avoid a blocking discovery-document fetch on first request.
if settings.google_client_id:
    oauth.register(
        name="google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
        access_token_url="https://oauth2.googleapis.com/token",
        userinfo_endpoint="https://openidconnect.googleapis.com/v1/userinfo",
        jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
        client_kwargs={"scope": "openid email profile"},
    )

# ── Facebook ──────────────────────────────────────────────────────────────────
if settings.facebook_client_id:
    oauth.register(
        name="facebook",
        client_id=settings.facebook_client_id,
        client_secret=settings.facebook_client_secret,
        authorize_url="https://www.facebook.com/dialog/oauth",
        access_token_url="https://graph.facebook.com/oauth/access_token",
        api_base_url="https://graph.facebook.com/",
        client_kwargs={
            "scope": "email public_profile",
            "token_endpoint_auth_method": "client_secret_post",
        },
    )
