const plugins = {};

function register(name, handler) {
    plugins[name] = handler;
}

function get(name) {
    return plugins[name];
}

module.exports = { register, get };