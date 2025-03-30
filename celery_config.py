broker_url  = "redis://localhost:6379/0"
result_backend  = "redis://localhost:6379/1"
Timezone = "Asia/Kolkata"
enable_utc = False  # Ensure Celery does not use UTC
broker_connection_retry_on_startup = True