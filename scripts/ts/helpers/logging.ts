import chalk, {ChalkInstance} from "chalk";

export function visibleLog(message: string, chalk?: ChalkInstance) {
    console.log(chalkMessage("==========================================================", chalk));
    console.log(chalkMessage(message, chalk));
    console.log(chalkMessage("==========================================================", chalk));
}

function chalkMessage(message: string, chalk?: ChalkInstance) {
    return chalk ? chalk(message) : message;
}

export function logSuccess(message: string) {
    console.log(chalk.green(message));
}

export function logProgress(message: string) {
    console.log(chalk.grey(message));
}

export function logDebug(message: string) {
    if (process.env.DEBUG === 'true') {
        console.log(chalk.cyan(`[DEBUG] ${message}`));
    }
}

export function logWarn(message: string) {
    console.log(chalk.yellow(message));
}

export function logError(message: string) {
    console.log(chalk.red(message));
}