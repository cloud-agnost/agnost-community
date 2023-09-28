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
details_list = []

for k,v in app_env_dict.items():
    if os.environ[k] != 'not-changed':
        released_app_list.append(v)
        if v.startswith('engine'):
            root_dir = "engine"
        elif v.startswith('platform'):
            root_dir = "platform"
        else:
            root_dir = "."
        details_list.append({"application": v, "version": os.environ[k], "rootdir": root_dir})

released_apps = str(released_app_list).replace(' ', '').replace('\'', '\\"')
details = json.dumps(details_list, separators=(',', ':')).replace('"', '\\"')
print("{} {}".format(released_apps, details))
