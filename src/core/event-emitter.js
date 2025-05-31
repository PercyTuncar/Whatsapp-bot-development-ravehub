// src/core/event-emitter.js
import { EventEmitter } from "events"

const emitter = new EventEmitter()
// Increase max listeners if necessary, though good design should avoid too many direct listeners on one event.
// emitter.setMaxListeners(20);

export default emitter
