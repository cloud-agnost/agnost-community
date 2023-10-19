import sys
import json
import os

release_number = os.environ['RELEASE_NUMBER']
release_file = os.path.join('releases', release_number + '.json')
latest_file = os.path.join('releases', 'latest.json')
applications = ['engine/core', 'engine/monitor', 'engine/realtime', 'engine/scheduler', 'engine/worker',
                'platform/core', 'platform/sync', 'platform/worker', 'studio']

new_release_dict = {}

for app in applications:
  package_file = os.path.join(app, 'package.json')
  with open(package_file) as fp:
        package_info = json.load(fp)
  version = package_info['version']
  app_name = app.replace('/', '-')
  new_release_dict[app_name] = version

with open(release_file, 'w') as fp:
  fp.write(json.dumps(new_release_dict, indent=3))
  fp.close()

with open(latest_file, 'w') as fp:
  fp.write(json.dumps(new_release_dict, indent=3))
  fp.close()
