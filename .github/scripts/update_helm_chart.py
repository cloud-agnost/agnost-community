import sys
import json
from ruamel.yaml import YAML

yaml=YAML()
yaml.preserve_quotes = True
values_yaml = "base/values.yaml"
chart_yaml = "base/Chart.yaml"
applications = json.loads(sys.argv[1])

## Update values.yaml with the new image tags
values_data = yaml.load(open(values_yaml).read())

for app in applications:
    if '/' in app['application']:
        app_type, app_name = app['application'].split('/')
        if app_name == 'core':
            continue
        values_data[app_type][app_name]['tag'] = app['version']

with open(values_yaml, 'w') as outfile:
    yaml.dump(values_data, outfile)

## Update Chart.yaml with a new version
chart_data = yaml.load(open(chart_yaml).read())
version = [int(n) for n in chart_data['version'].split('.')]
version[2] += 1
new_version = [str(n) for n in version]
chart_data['version'] = '.'.join(new_version)

with open(chart_yaml, 'w') as outfile:
    yaml.dump(chart_data, outfile)
