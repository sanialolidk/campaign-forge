from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from campaign_forge.api.routes import auth, modules, tools

app = FastAPI(title="Campaign Forge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*\.vercel\.app|http://localhost:\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(modules.router, prefix="/modules", tags=["modules"])
app.include_router(tools.router, prefix="/tools", tags=["tools"])


@app.get("/health")
def health():
    return {"status": "ok"}
