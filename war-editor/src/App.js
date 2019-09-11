"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
require("./App.css");
const react_router_dom_1 = require("react-router-dom");
const Hello_tsx_1 = __importDefault(require("./ts/compoment/Hello.tsx"));
class App extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.render = () => {
            return (react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
                react_1.default.createElement(react_router_dom_1.Switch, null,
                    react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/", component: Hello_tsx_1.default }))));
        };
    }
}
exports.default = App;
