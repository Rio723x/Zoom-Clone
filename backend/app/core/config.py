from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./zoomclone.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    default_host_name: str = "Alex Johnson"

    # VideoSDK credentials are read from the environment, never sent to the browser.
    videosdk_api_key: str = ""
    videosdk_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
