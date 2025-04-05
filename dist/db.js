"use strict";
// src/lib/db.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawDb = exports.db = void 0;
exports.query = query;
exports.getRoutes = getRoutes;
exports.getRoutesCount = getRoutesCount;
exports.getAirlines = getAirlines;
exports.getAirports = getAirports;
exports.getCountries = getCountries;
exports.getRouteById = getRouteById;
exports.getMaxDuration = getMaxDuration;
var better_sqlite3_1 = require("drizzle-orm/better-sqlite3");
var better_sqlite3_2 = require("better-sqlite3");
var path_1 = require("path");
var schema = require("./schema");
// Initialize the database connection
var sqlite = new better_sqlite3_2.default(path_1.default.join(process.cwd(), "routes.db"), {
    readonly: false,
    fileMustExist: false, // Allow creating the database if it doesn't exist
});
// Enable foreign keys
sqlite.pragma("foreign_keys = ON");
// Create tables if they don't exist
sqlite.exec("\n  CREATE TABLE IF NOT EXISTS pilots (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    home_base TEXT NOT NULL,\n    current_location TEXT NOT NULL,\n    preferred_airline TEXT,\n    created_at TEXT NOT NULL,\n    updated_at TEXT NOT NULL\n  );\n\n  CREATE TABLE IF NOT EXISTS schedules (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    pilot_id TEXT NOT NULL,\n    name TEXT NOT NULL,\n    start_location TEXT NOT NULL,\n    end_location TEXT NOT NULL,\n    duration_days INTEGER NOT NULL,\n    haul_preferences TEXT NOT NULL,\n    created_at TEXT NOT NULL,\n    updated_at TEXT NOT NULL\n  );\n");
// Create drizzle database instance
exports.db = (0, better_sqlite3_1.drizzle)(sqlite, { schema: schema });
// Export the raw sqlite instance for migrations
exports.rawDb = sqlite;
// Helper function to run queries with proper error handling
function query(sql, params) {
    if (params === void 0) { params = []; }
    try {
        var stmt = sqlite.prepare(sql);
        return stmt.all(params);
    }
    catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}
// Get all routes with details (paginated)
function getRoutes() {
    return __awaiter(this, arguments, void 0, function (page, limit, filters) {
        var offset, sql, params;
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 20; }
        if (filters === void 0) { filters = {}; }
        return __generator(this, function (_a) {
            offset = (page - 1) * limit;
            sql = "\n    SELECT \n      route_id,\n      departure_iata,\n      departure_city,\n      departure_country,\n      arrival_iata,\n      arrival_city,\n      arrival_country,\n      distance_km,\n      duration_min,\n      airline_iata,\n      airline_name\n    FROM route_details\n    WHERE 1=1\n  ";
            params = [];
            if (filters.airline) {
                sql += " AND airline_name LIKE ?";
                params.push("%".concat(filters.airline, "%"));
            }
            if (filters.departure) {
                sql += " AND (departure_iata = ? OR departure_city LIKE ?)";
                params.push(filters.departure, "%".concat(filters.departure, "%"));
            }
            if (filters.arrival) {
                sql += " AND (arrival_iata = ? OR arrival_city LIKE ?)";
                params.push(filters.arrival, "%".concat(filters.arrival, "%"));
            }
            if (filters.country) {
                sql += " AND (departure_country = ? OR arrival_country = ?)";
                params.push(filters.country, filters.country);
            }
            if (filters.maxDuration && !isNaN(Number(filters.maxDuration))) {
                sql += " AND duration_min <= ?";
                params.push(filters.maxDuration);
            }
            sql += " ORDER BY departure_iata, arrival_iata LIMIT ? OFFSET ?";
            params.push(limit, offset);
            return [2 /*return*/, query(sql, params)];
        });
    });
}
// Get route count (for pagination)
function getRoutesCount() {
    return __awaiter(this, arguments, void 0, function (filters) {
        var sql, params, result;
        var _a;
        if (filters === void 0) { filters = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sql = "\n    SELECT COUNT(*) as count\n    FROM route_details\n    WHERE 1=1\n  ";
                    params = [];
                    if (filters.airline) {
                        sql += " AND airline_name LIKE ?";
                        params.push("%".concat(filters.airline, "%"));
                    }
                    if (filters.departure) {
                        sql += " AND (departure_iata = ? OR departure_city LIKE ?)";
                        params.push(filters.departure, "%".concat(filters.departure, "%"));
                    }
                    if (filters.arrival) {
                        sql += " AND (arrival_iata = ? OR arrival_city LIKE ?)";
                        params.push(filters.arrival, "%".concat(filters.arrival, "%"));
                    }
                    if (filters.country) {
                        sql += " AND (departure_country = ? OR arrival_country = ?)";
                        params.push(filters.country, filters.country);
                    }
                    if (filters.maxDuration && !isNaN(Number(filters.maxDuration))) {
                        sql += " AND duration_min <= ?";
                        params.push(filters.maxDuration);
                    }
                    return [4 /*yield*/, query(sql, params)];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0];
            }
        });
    });
}
// Get all airlines
function getAirlines() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, query("\n    SELECT DISTINCT iata, name\n    FROM airlines\n    ORDER BY name\n  ")];
        });
    });
}
// Get all airports
function getAirports() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, query("\n    SELECT iata, name, city_name, country\n    FROM airports\n    ORDER BY city_name\n  ")];
        });
    });
}
// Get all countries that have airports
function getCountries() {
    return __awaiter(this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query("\n    SELECT DISTINCT country\n    FROM airports\n    WHERE country != ''\n    ORDER BY country\n  ")];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.map(function (r) { return r.country; })];
            }
        });
    });
}
// Get route by ID
function getRouteById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var routes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query("\n    SELECT \n      route_id,\n      departure_iata,\n      departure_city,\n      departure_country,\n      arrival_iata,\n      arrival_city,\n      arrival_country,\n      distance_km,\n      duration_min,\n      airline_iata,\n      airline_name\n    FROM route_details\n    WHERE route_id = ?\n  ", [id])];
                case 1:
                    routes = _a.sent();
                    return [2 /*return*/, routes[0]];
            }
        });
    });
}
// Get maximum route duration (for slider)
function getMaxDuration() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, query("\n    SELECT MAX(duration_min) as max_duration\n    FROM routes\n  ")];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.max_duration) || 0];
            }
        });
    });
}
