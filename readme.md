# Homebridge Http Temperature Humidity

## Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-http-temperature-humidity using: npm install -g homebridge-http-temperature-humidity
3. Update your configuration file. See [Example Config](#example-config) for a sample.

## Configuration

### Parameters
| parameter       | description                                                | default                 | required |
|-----------------|------------------------------------------------------------|-------------------------|----------|
| url             | The url to fetch temperature (and humidity)                | /                       | true     |
| name            | Name of the homekit accessory                              | /                       | true     |
| manufacturer    | Name of the manufacturer of the accessory                  | HttpTemperatureHumidity | false    |
| model           | Name of the model of the accessory                         | Default                 | false    |
| serial          | Serial of the accessory                                    | 18981898                | false    |
| disableHumidity | Should humidity be disabled?                               | false                   | false    |

### Example Config

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "CD:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-156"
  },

  "description": "Example",

  "platforms": [],

  "accessories": [
    {
      "accessory": "HttpTemperatureHumidity",
      "name": "Temperature and Humidity",
      "url": "http://192.168.178.210/temp/status"
    }
  ]
}
```
## Response
The response must be in the following format:
```json
{
    "temperature": 25.8,
    "humidity": 38
}
```