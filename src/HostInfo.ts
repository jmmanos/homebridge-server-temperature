import { readFileSync } from "fs";
import { execSync } from "child_process";
import * as os from "os";

export class HostInfo {
    public platform = os.platform();
    public type = os.type();
    public model: string;
    public version = os.release();
    public serialNumber: string;
    public name = os.hostname();

    constructor() {
        this.model = this.getModel();
        this.serialNumber = this.getSerialNumber();
    }

    public getCurrentTemperature(): number {
        switch (this.platform) {
            case "linux":
                let val = readFileSync("/sys/class/thermal/thermal_zone0/temp", {encoding: 'utf8'});
                return parseFloat(val)/1000;
            default:
                return 0;
        }
    }

    private getModel(): string {
        switch (this.platform) {
            case "linux":
                return readFileSync("/proc/device-tree/model", {encoding: 'utf8'});
            case "darwin":
                return execSync("sysctl -n hw.model", {encoding: 'utf8'});
            default:
                return "unknown";
        }
    }

    private getSerialNumber(): string {
        switch (this.platform) {
            case "linux":
                return readFileSync("/proc/device-tree/serial-number", {encoding: 'utf8'});
            case "darwin":
                return execSync(
                    "ioreg -c IOPlatformExpertDevice -d 2 | awk -F\" '/IOPlatformSerialNumber/{print $(NF-1)}'",
                    {encoding: 'utf8'}
                    );
            default:
                return "unknown";
        }
    }

}