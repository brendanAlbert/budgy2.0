const availableChars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const guid = () => {
    let newGuid = "";
    for (let i = 0; i < 36; i++) {
        newGuid +=
            availableChars[Math.floor(Math.random() * availableChars.length)];
        if (i === 8 || i === 13 || i === 18 || i === 23) newGuid += "-";
    }
    return newGuid;
};
