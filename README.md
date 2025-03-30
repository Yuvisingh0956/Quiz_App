# Quiz MAster

It is a multi-user app (one requires an administrator and other users) that acts as an exam preparation site for multiple courses.

# Running

- Make sure to get Python 3.10.12 or higher.
- Create a virtual environment.

```
python3 -m venv .venv
```

- Activate the virtual environment.

```
source .venv/bin/activate
```

- Install the dependencies.

```
pip install -r requirements.txt
```

- In case of error: `ModuleNotFoundError: No module named 'pkg_resources'`

```
pip install --upgrade setuptools
```

- Run.

```
python app.py
```

- To run backend task run following each commands in separate terminal in linux or wsl (in each terminal activate virtual environment):

```
redis-server
```

```
celery -A app.celery worker --loglevel=info
```

```
celery -A app.celery  beat --loglevel INFO
```

```
MailHog
```
