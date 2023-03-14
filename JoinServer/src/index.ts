import {startServer as initTCP} from "./utils/tcp";
import ports from "../config/ports.json";

initTCP(ports.tcp);
