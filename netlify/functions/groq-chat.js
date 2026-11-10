'use strict';

// Keep existing internal callers working while /chat is the canonical endpoint.
exports.handler = require('./chat').handler;
