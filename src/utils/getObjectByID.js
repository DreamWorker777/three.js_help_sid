export const getObjectByID = (prop, n) => {
    let child;
    prop.children.every((c) => {
        if (c.name === n) {
            child = c;
            return true;
        }
        return false;
    });
    if (child) {
        return child;
    } else {
        return null;
    }
};
