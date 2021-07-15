"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const fs = __importStar(require("fs"));
let hap;
class LocalTemperatureHumidityAccessory {
    constructor(log, config) {
        /* Characteristic States */
        this.accessoryState = {
            temperature: 0,
            humidity: 0,
        };
        this.log = log;
        //Retrieve Configuration
        this.name = config.name;
        this.path = config.path;
        this.manufacturer = config.manufacturer || "LocalTemperatureHumidity";
        this.model = config.model || "Default";
        this.serial = config.serial || "18981898";
        this.refresh_interval = config.refresh || 30;
        this.disableHumidity = config.disableHumidity || false;
        // Define TemperatureService
        this.temperatureService = new hap.Service.TemperatureSensor("Temperature");
        this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature).onGet(this.getCurrentTemperature.bind(this));
        // Define HumidityService
        this.humidityService = new hap.Service.HumiditySensor("Humidity");
        if (this.disableHumidity !== true) {
            this.humidityService.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity).onGet(this.getCurrentRelativeHumidity.bind(this));
        }
        // Define InformationService
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(hap.Characteristic.Model, this.model)
            .setCharacteristic(hap.Characteristic.SerialNumber, this.serial);
        setInterval(() => {
            this.updateAllStates().then(() => {
                // push the new value to HomeKit
                this.temperatureService.updateCharacteristic(hap.Characteristic.CurrentTemperature, this.accessoryState.temperature);
                if (this.disableHumidity !== true) {
                    this.humidityService.updateCharacteristic(hap.Characteristic.CurrentRelativeHumidity, this.accessoryState.humidity);
                }
                this.log.debug("Triggering updateAccessoryState");
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
        this.log("Identify!");
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
        this.log("getCurrentTemperature: " + currentTemperature);
        return currentTemperature;
    }
    getCurrentRelativeHumidity() {
        const currentRelativeHumidity = this.accessoryState.humidity;
        this.log("getCurrentRelativeHumidity: " + currentRelativeHumidity);
        return currentRelativeHumidity;
    }
    async updateAllStates() {
        let updated = false;
        await this.callServer()
            .then((temperatureAndHumidity) => {
            this.log.debug("CallServerResponse: Temperature: " + temperatureAndHumidity.temperature + " Humidity: " + temperatureAndHumidity.humidity);
            this.accessoryState.temperature = temperatureAndHumidity.temperature;
            this.accessoryState.humidity = temperatureAndHumidity.humidity;
            updated = true;
        })
            .catch((error) => {
            this.log("updateAllStates Error : " + error.message);
        });
        return updated;
    }
    async callServer() {
        let temparatureAndHumidity = new TemperatureAndHumidity();
        const file = fs.readFileSync(this.path, 'utf-8');
        let json = JSON.parse(file);
        temparatureAndHumidity = new TemperatureAndHumidity(json.temperature, json.humidity);
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
    api.registerAccessory("homebridge-local-temperature-humidity-sensor", "LocalTemperatureHumiditySensor", LocalTemperatureHumidityAccessory);
};
//# sourceMappingURL=homebridge-local-temperature-humidity.js.map