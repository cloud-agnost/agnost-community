import json
import os

app_env_list = ['ENGINE_CORE', 'ENGINE_MONITOR', 'ENGINE_REALTIME', 'ENGINE_SCHEDULER',
                'ENGINE_WORKER','PLATFORM_CORE', 'PLATFORM_SYNC', 'PLATFORM_WORKER', 'STUDIO']

released_app_list = []
details_list = []

for env in app_env_list:
    if os.environ[env] != 'not-changed':
        if env == 'STUDIO':
            appdir = 'studio'
            rootdir = '.'
        else:
            rootdir, appdir = env.lower().split('_')
        app = env.lower().replace('_', '-')
        released_app_list.append(app)
        details_list.append({"application": app, "version": os.environ[env], "rootdir": rootdir, "appdir": appdir})

released_apps = str(released_app_list).replace(' ', '').replace('\'', '\\"')
details = json.dumps(details_list, separators=(',', ':')).replace('"', '\\"')
print("{} {}".format(released_apps, details))
