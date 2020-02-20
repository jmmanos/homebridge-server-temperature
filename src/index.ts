import { HostInfo } from "./HostInfo";

let Service: any, Characteristic: any;

export default function(homebridge: any) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-server-temperature", "ServerTemperature", ServerTemperatureAccessory);
}

class ServerTemperatureAccessory {

    private log: any;

    // Services
    private infoService: any;
    private temperatureService: any;

    constructor(log: any, config: any) {
        this.log = log;

        const updateInterval = config["updateInterval"] || 5000;
        const hostInfo = new HostInfo();

        const getCurrentTemperature: () => number = () => {
            const temp = hostInfo.getCurrentTemperature();
            this.log.debug("Server temp updated => " + temp);
            return temp;
        };

        this.infoService = new Service.AccessoryInformation();
        this.infoService
            .setCharacteristic(Characteristic.Manufacturer, hostInfo.type)
            .setCharacteristic(Characteristic.Model, hostInfo.model)
            .setCharacteristic(Characteristic.SerialNumber, hostInfo.serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, hostInfo.version);

        this.temperatureService = new Service.TemperatureSensor(hostInfo.name);
        const temperatureCharacteristic = this.temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature);

        temperatureCharacteristic.updateValue(getCurrentTemperature());
        temperatureCharacteristic
            .on("get", (callback: any) => {
                callback(null, getCurrentTemperature());
            });

        if (updateInterval > 0) {
            setInterval(() => {
                temperatureCharacteristic.updateValue(getCurrentTemperature());
            }, updateInterval);
        }
    }

    getServices() {
        return [
            this.infoService,
            this.temperatureService
        ]
    }
}