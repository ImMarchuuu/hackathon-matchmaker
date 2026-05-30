from authlib.integrations.starlette_client import OAuth

from app.core.config import settings

oauth = OAuth()

# ── Google ────────────────────────────────────────────────────────────────────
if settings.google_client_id:
    oauth.register(
        name="google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
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
