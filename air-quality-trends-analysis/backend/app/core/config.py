import os
from typing import List

class Settings:
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

    @property
    def API_KEY(self) -> str:
        return os.getenv("API_KEY", "dev-key-123")

    @property
    def DEFAULT_PLAN(self) -> str:
        return os.getenv("DEFAULT_PLAN", "free")

settings = Settings()
