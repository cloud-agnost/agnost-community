import json
import os

app_env_dict = { 'ENGINE_CORE': 'engine-core',
                 'ENGINE_MONITOR': 'engine-monitor',
                 'ENGINE_REALTIME': 'engine-realtime',
                 'ENGINE_SCHEDULER': 'engine-scheduler',
                 'ENGINE_WORKER': 'engine-worker',
                 'PLATFORM_CORE': 'platform-core',
                 'PLATFORM_SYNC': 'platform-sync',
                 'PLATFORM_WORKER': 'platform-worker',
                 'STUDIO': 'studio'}

released_app_list = []
version_list = []

for k,v in app_env_dict.items():
    if os.environ[k] != 'not-changed':
        released_app_list.append(v)
        version_list.append({'app': v, 'version': os.environ[k]})

released_apps = str(released_app_list).replace(' ', '')
versions = json.dumps(version_list, separators=(',', ':')).replace('"', '\\"')
print("{} {}".format(released_apps, versions))
