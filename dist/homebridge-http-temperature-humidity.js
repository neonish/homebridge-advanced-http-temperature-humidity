"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
let hap;
class HttpTemperatureHumidityAccessory {
    constructor(log, config) {
        /* Characteristic States */
        this.accessoryState = {
            temperature: 0,
            humidity: 0,
        };
        this.log = log;
        //Retrieve Configuration
        this.name = config.name;
        this.url = config.url;
        this.manufacturer = config.manufacturer || 'HttpTemperatureHumidity';
        this.model = config.model || 'Default';
        this.serial = config.serial || '18981898';
        this.refresh_interval = config.refresh || 30;
        this.disableHumidity = config.disableHumidity || false;
        // Define TemperatureService
        this.temperatureService = new hap.Service.TemperatureSensor('Temperature');
        this.temperatureService
            .getCharacteristic(hap.Characteristic.CurrentTemperature)
            .onGet(this.getCurrentTemperature.bind(this));
        // Define HumidityService
        this.humidityService = new hap.Service.HumiditySensor('Humidity');
        if (this.disableHumidity !== true) {
            this.humidityService
                .getCharacteristic(hap.Characteristic.CurrentRelativeHumidity)
                .onGet(this.getCurrentRelativeHumidity.bind(this));
        }
        // Define InformationService
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(hap.Characteristic.Model, this.model)
            .setCharacteristic(hap.Characteristic.SerialNumber, this.serial);
        setInterval(() => {
            this.updateAllStates()
                .then(() => {
                // push the new value to HomeKit
                this.temperatureService.updateCharacteristic(hap.Characteristic.CurrentTemperature, this.accessoryState.temperature);
                if (this.disableHumidity !== true) {
                    this.humidityService.updateCharacteristic(hap.Characteristic.CurrentRelativeHumidity, this.accessoryState.humidity);
                }
                this.log.debug('Triggering updateAccessoryState');
            });
        }, this.getRefreshIntervalInMillis());
        //Initialize state
        this.updateAllStates();
        log.info(`${this.name} finished initializing!`);
        log.debug(`Will refresh state every ${this.refresh_interval}sec`);
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        this.log('Identify!');
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        const services = new Array(this.informationService, this.temperatureService);
        if (this.disableHumidity !== true) {
            services.push(this.humidityService);
        }
        return services;
    }
    getCurrentTemperature() {
        const currentTemperature = this.accessoryState.temperature;
        this.log('getCurrentTemperature: ' + currentTemperature);
        return currentTemperature;
    }
    getCurrentRelativeHumidity() {
        const currentRelativeHumidity = this.accessoryState.humidity;
        this.log('getCurrentRelativeHumidity: ' + currentRelativeHumidity);
        return currentRelativeHumidity;
    }
    async updateAllStates() {
        let updated = false;
        await this.callServer()
            .then((temperatureAndHumidity) => {
            this.log.debug('CallServerResponse: Temperature: '
                + temperatureAndHumidity.temperature
                + ' Humidity: '
                + temperatureAndHumidity.humidity);
            this.accessoryState.temperature = temperatureAndHumidity.temperature;
            this.accessoryState.humidity = temperatureAndHumidity.humidity;
            updated = true;
        })
            .catch((error) => {
            this.log('updateAllStates Error : ' + error.message);
        });
        return updated;
    }
    async callServer() {
        let temparatureAndHumidity = new TemperatureAndHumidity();
        await axios_1.default.get(this.url)
            .then((response) => {
            temparatureAndHumidity = response.data;
        });
        return temparatureAndHumidity;
    }
    getRefreshIntervalInMillis() {
        return this.refresh_interval * 1000;
    }
}
class TemperatureAndHumidity {
    constructor(temperature = 0, humidity = 0) {
        this.temperature = temperature;
        this.humidity = humidity;
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerAccessory('homebridge-http-temperature-humidity', 'HttpTemperatureHumiditySensor', HttpTemperatureHumidityAccessory);
};
//# sourceMappingURL=homebridge-http-temperature-humidity.js.map