"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withoutPassword = withoutPassword;
function withoutPassword(usuario) {
    const profile = { ...usuario };
    delete profile.passwordHash;
    return profile;
}
//# sourceMappingURL=utils.js.map