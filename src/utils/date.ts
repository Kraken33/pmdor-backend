export function getCurrentTimestamp() {
    return new Date(new Date().toDateString()).getTime();
}