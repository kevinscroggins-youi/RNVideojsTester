/**
 * @file YiVideojsVideoPlayer.js
 * @brief JavaScript class for wrapping the Video.js MSE video player with contrib EME plugin.
 */

"use strict";

function CYIVideojsVideoPlayerVersion(version) {
    var self = this;

    var _properties = { };

    Object.defineProperty(self, "major", {
        enumerable: true,
        get() {
            return _properties.major;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(isNaN(newValue) || newValue < 0) {
                throw CYIUtilities.createError("Invalid major version value: \"" + CYIUtilities.toString(value) + "\".");
            }

            _properties.major = newValue;
        }
    });

    Object.defineProperty(self, "minor", {
        enumerable: true,
        get() {
            return _properties.minor;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(isNaN(newValue) || newValue < 0) {
                throw CYIUtilities.createError("Invalid minor version value: \"" + CYIUtilities.toString(value) + "\".");
            }

            _properties.minor = newValue;
        }
    });

    Object.defineProperty(self, "patch", {
        enumerable: true,
        get() {
            return _properties.patch;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(isNaN(newValue) || newValue < 0) {
                throw CYIUtilities.createError("Invalid patch version value: \"" + CYIUtilities.toString(value) + "\".");
            }

            _properties.patch = newValue;
        }
    });

    Object.defineProperty(self, "version", {
        enumerable: true,
        configurable: true,
        get() {
            return _properties.major + "." + _properties.minor + "." + _properties.patch;
        },
        set(value) {
            var newValue = CYIUtilities.trimString(value);

            if(CYIUtilities.isEmptyString(newValue)) {
                throw CYIUtilities.createError("Invalid version value: \"" + CYIUtilities.toString(value) + "\".");
            }

            var rawVersionData = newValue.match(CYIVideojsVideoPlayerVersion.PlayerVersionRegex);

            if(CYIUtilities.isInvalid(rawVersionData)) {
                throw CYIUtilities.createError("Invalid version: \"" + newValue + "\".");
            }

            _properties.major = rawVersionData[2];
            _properties.minor = rawVersionData[3];
            _properties.patch = rawVersionData[4];
        }
    });

    Object.defineProperty(self, "full", {
        enumerable: true,
        configurable: true,
        get() {
            return self.version;
        }
    });

    self.version = version;
}

CYIVideojsVideoPlayerVersion.isExtendedBy = function CYIVideojsVideoPlayerVersion(playerClass) {
    if(!(playerClass instanceof Object)) {
        return false;
    }

    var playerClassPrototype = null;

    if(playerClass instanceof Function) {
        playerClassPrototype = playerClass.prototype;
    }
    else {
        playerClassPrototype = playerClass.constructor.prototype;
    }

    return playerClassPrototype instanceof CYIVideojsVideoPlayer;
};

CYIVideojsVideoPlayerVersion.isVideoPlayerVersion = function isVideoPlayerVersion(value) {
    return value instanceof CYIVideojsVideoPlayerVersion;
};

function CYIVideojsVideoPlayerState(id, attributeName, displayName) {
    var self = this;

    if(CYIUtilities.isObject(id)) {
        var data = id;
        id = data.id;
        attributeName = data.attributeName;
        displayName = data.displayName;
    }

    var _properties = {
        transitionStates: []
    };

    Object.defineProperty(self, "id", {
        enumerable: true,
        get() {
            return _properties.id;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(isNaN(newValue)) {
                throw CYIUtilities.createError("Invalid id value, expected integer.");
            }

            _properties.id = newValue;
        }
    });

    Object.defineProperty(self, "attributeName", {
        enumerable: true,
        get() {
            return _properties.attributeName;
        },
        set(value) {
            var newValue = CYIUtilities.trimString(value);

            if(CYIUtilities.isEmptyString(newValue)) {
                throw CYIUtilities.createError("Invalid attribute name, expected non-empty string.");
            }

            _properties.attributeName = newValue;
        }
    });

    Object.defineProperty(self, "displayName", {
        enumerable: true,
        get() {
            return _properties.displayName;
        },
        set(value) {
            var newValue = CYIUtilities.trimString(value);

            if(CYIUtilities.isEmptyString(newValue)) {
                throw CYIUtilities.createError("Invalid display name, expected non-empty string.");
            }

            _properties.displayName = newValue;
        }
    });

    Object.defineProperty(self, "transitionStates", {
        enumerable: true,
        get() {
            return _properties.transitionStates;
        },
        set(value) {
            if(!Array.isArray(value)) {
                throw CYIUtilities.createError("Invalid transition states collection!");
            }

            for(var i = 0; i < value.length; i++) {
                var state = value[i];

                if(!CYIVideojsVideoPlayerState.isVideoPlayerState(state) || state.id < 0) {
                    throw CYIUtilities.createError("Invalid transition state at index " + i + "!");
                }

                if(self.id === state.id) {
                    throw CYIUtilities.createError("Transition state at index " + i + " must have a different id from the current state.");
                }

                for(var j = i + 1; j < value.length; j++) {
                    if(value[i].id === value[j].id) {
                        throw CYIUtilities.createError("Duplicate transition state with id: " + value[i].id + " found at index " + j + ".");
                    }
                }
            }

            _properties.transitionStates.length = 0;
            Array.prototype.push.apply(_properties.transitionStates, value);
        }
    });

    self.id = id;
    self.attributeName = attributeName;

    if(CYIUtilities.isEmptyString(displayName)) {
        self.displayName = self.attributeName;
    }
    else {
        self.displayName = displayName;
    }
}

CYIVideojsVideoPlayerState.isExtendedBy = function isExtendedBy(videoPlayerStateClass) {
    if(!(videoPlayerStateClass instanceof Object)) {
        return false;
    }

    var videoPlayerStateClassPrototype = null;

    if(videoPlayerStateClass instanceof Function) {
        videoPlayerStateClassPrototype = videoPlayerStateClass.prototype;
    }
    else {
        videoPlayerStateClassPrototype = videoPlayerStateClass.constructor.prototype;
    }

    return videoPlayerStateClassPrototype instanceof CYIVideojsVideoPlayerState;
};

CYIVideojsVideoPlayerState.prototype.numberOfTransitionStates = function numberOfTransitionStates() {
    var self = this;

    return self.transitionStates.length;
};

CYIVideojsVideoPlayerState.prototype.hasTransitionState = function hasTransitionState(state) {
    var self = this;

    return self.indexOfTransitionState(state) !== -1;
};

CYIVideojsVideoPlayerState.prototype.indexOfTransitionState = function indexOfTransitionState(state) {
    var self = this;

    if(!CYIVideojsVideoPlayerState.isVideoPlayerState(state)) {
        return -1;
    }

    for(var i = 0; i < self.transitionStates.length; i++) {
        if(self.transitionStates[i].id === state.id) {
            return i;
        }
    }

    return -1;
};

CYIVideojsVideoPlayerState.prototype.indexOfTransitionStateWithId = function indexOfTransitionStateWithId(id) {
    var self = this;

    id = CYIUtilities.parseInteger(id);

    if(isNaN(id)) {
        return -1;
    }

    for(var i = 0; i < self.transitionStates.length; i++) {
        if(self.transitionStates[i].id === id) {
            return i;
        }
    }

    return -1;
};

CYIVideojsVideoPlayerState.prototype.canTransitionTo = function canTransitionTo(state) {
    var self = this;

    if(!CYIVideojsVideoPlayerState.isVideoPlayerState(state) || !state.isValid() || self.id === state.id) {
        return false;
    }

    return self.hasTransitionState(state);
};

CYIVideojsVideoPlayerState.prototype.getTransitionStateWithId = function getTransitionStateWithId(id) {
    var self = this;

    var transitionStateIndex = self.indexOfTransitionStateWithId(id);

    if(transitionStateIndex === -1) {
        return null;
    }

    return self.transitionStates[transitionStateIndex];
};

CYIVideojsVideoPlayerState.prototype.getTransitionStateAtIndex = function getTransitionStateAtIndex(index) {
    var self = this;

    index = CYIUtilities.parseInteger(index);

    if(isNaN(index) || index < 0 || index >= self.transitionStates.length) {
        return null;
    }

    return self.transitionStates[index];
};

CYIVideojsVideoPlayerState.prototype.addTransitionState = function addTransitionState(state) {
    var self = this;

    if(!CYIVideojsVideoPlayerState.isValid(state) || self.id === state.id || self.hasTransitionState(state)) {
        return false;
    }

    self.transitionStates.push(state);

    return true;
};

CYIVideojsVideoPlayerState.prototype.removeTransitionState = function removeTransitionState(state) {
    var self = this;

    var transitionStateIndex = self.indexOfTransitionState(state);

    if(transitionStateIndex === -1) {
        return false;
    }

    self.transitionStates.splice(transitionStateIndex, 1);

    return true;
};

CYIVideojsVideoPlayerState.prototype.removeTransitionStateWithId = function removeTransitionStateWithId(id) {
    var self = this;

    var transitionStateIndex = self.indexOfTransitionStateWithId(id);

    if(transitionStateIndex === -1) {
        return false;
    }

    self.transitionStates.splice(transitionStateIndex, 1);

    return true;
};

CYIVideojsVideoPlayerState.prototype.removeTransitionStateAtIndex = function removeTransitionStateAtIndex(index) {
    var self = this;

    index = CYIUtilities.parseInteger(index);

    if(isNaN(index) || index < 0 || index >= self.transitionStates.length) {
        return false;
    }

    self.transitionStates.splice(index, 1);

    return true;
};

CYIVideojsVideoPlayerState.prototype.clearTransitionStates = function clearTransitionStates() {
    var self = this;

    self.transitionStates.length = 0;
};

CYIVideojsVideoPlayerState.prototype.equals = function equals(value) {
    var self = this;

    if(!CYIVideojsVideoPlayerState.isVideoPlayerState(value)) {
        return false;
    }

    return self.id === value.id;
};

CYIVideojsVideoPlayerState.prototype.toString = function toString() {
    var self = this;

    return self.displayName + " Video Player State";
};

CYIVideojsVideoPlayerState.isVideoPlayerState = function isVideoPlayerState(value) {
    return value instanceof CYIVideojsVideoPlayerState;
};

CYIVideojsVideoPlayerState.prototype.isValid = function isValid() {
    var self = this;

    return self.id >= 0;
};

CYIVideojsVideoPlayerState.isValid = function isValid(value) {
    return (CYIVideojsVideoPlayerState.isVideoPlayerState(value) || CYIVideojsVideoPlayerState.isExtendedBy(value)) &&
           value.isValid();
};

function CYIVideojsVideoPlayerStreamFormat(streamFormat, drmTypes) {
    var self = this;

    var _properties = {
        format: null,
        drmTypes: []
    }

    Object.defineProperty(self, "format", {
        enumerable: true,
        get() {
            return _properties.format;
        },
        set(value) {
            _properties.format = CYIUtilities.trimString(value);
        }
    });

    Object.defineProperty(self, "drmTypes", {
        enumerable: true,
        get() {
            return _properties.drmTypes;
        },
        set(value) {
            _properties.drmTypes.length = 0;

            if(CYIUtilities.isNonEmptyArray(value)) {
                for(var i = 0; i < value.length; i++) {
                    var formattedDRMType = CYIUtilities.trimString(value[i]);

                    if(CYIUtilities.isEmptyString(formattedDRMType)) {
                        continue;
                    }

                    for(var i = 0; i < _properties.drmTypes.length; i++) {
                        if(CYIUtilities.equalsIgnoreCase(_properties.drmTypes[i], formattedDRMType)) {
                            continue;
                        }
                    }

                    if(!CYIPlatformUtilities.isDRMTypeSupported(formattedDRMType)) {
                        continue;
                    }

                    _properties.drmTypes.push(formattedDRMType);
                }
            }
        }
    });

    self.format = streamFormat;
    self.drmTypes = drmTypes;
}

CYIVideojsVideoPlayerStreamFormat.prototype.numberOfDRMTypes = function numberOfDRMTypes() {
    var self = this;

    return self.drmTypes.length;
};

CYIVideojsVideoPlayerStreamFormat.prototype.hasDRMType = function hasDRMType(drmType) {
    var self = this;

    return self.indexOfDRMType(drmType) !== -1;
};

CYIVideojsVideoPlayerStreamFormat.prototype.indexOfDRMType = function indexOfDRMType(drmType) {
    var self = this;

    var formattedDRMType = CYIUtilities.trimString(drmType);

    if(CYIUtilities.isEmptyString(formattedDRMType)) {
        return -1;
    }

    for(var i = 0; i < self.drmTypes.length; i++) {
        if(CYIUtilities.equalsIgnoreCase(self.drmTypes[i], formattedDRMType)) {
            return i;
        }
    }

    return -1;
};

CYIVideojsVideoPlayerStreamFormat.prototype.addDRMType = function addDRMType(drmType) {
    var self = this;

    if(self.hasDRMType(drmType)) {
        return false;
    }

    var formattedDRMType = CYIUtilities.trimString(drmType);

    if(CYIUtilities.isEmptyString(formattedDRMType)) {
        return false;
    }

    if(!CYIPlatformUtilities.isDRMTypeSupported(formattedDRMType)) {
        return false;
    }

    self.drmTypes.push(formattedDRMType);

    return true;
};

CYIVideojsVideoPlayerStreamFormat.prototype.addDRMTypes = function addDRMTypes(drmTypes) {
    var self = this;

    if(CYIUtilities.isNonEmptyArray(drmTypes)) {
        for(var i = 0; i < drmTypes.length; i++) {
            self.addDRMType(drmTypes[i]);
        }
    }
};

CYIVideojsVideoPlayerStreamFormat.prototype.removeDRMType = function removeDRMType(drmType) {
    var self = this;

    var drmTypeIndex = self.indexOfDRMType(drmType);

    if(drmTypeIndex === -1) {
        return false;
    }

    self.drmTypes.splice(drmTypeIndex, 1);

    return true;
};

CYIVideojsVideoPlayerStreamFormat.prototype.clearDRMTypes = function clearDRMTypes() {
    var self = this;

    self.drmTypes.length = 0;
};

CYIVideojsVideoPlayerStreamFormat.prototype.equals = function equals(value) {
    var self = this;

    if(!self.isValid() || !CYIVideojsVideoPlayerStreamFormat.isValid(value)) {
        return false;
    }

    return CYIUtilities.equalsIgnoreCase(self.format, value.format);
};

CYIVideojsVideoPlayerStreamFormat.prototype.toString = function toString() {
    var self = this;

    return (CYIUtilities.isNonEmptyString(self.format) ? self.format : "Invalid") + (CYIUtilities.isNonEmptyArray(self.drmTypes) ? " (" + self.drmTypes.join(", ") + ")" : "");
};

CYIVideojsVideoPlayerStreamFormat.isStreamFormat = function isStreamFormat(value) {
    return value instanceof CYIVideojsVideoPlayerStreamFormat;
};

CYIVideojsVideoPlayerStreamFormat.prototype.isValid = function isValid() {
    var self = this;

    return Array.isArray(self.drmTypes);
};

CYIVideojsVideoPlayerStreamFormat.isValid = function isValid(value) {
    return CYIVideojsVideoPlayerStreamFormat.isStreamFormat(value) &&
           value.isValid();
};

function CYIRectangle(x, y, width, height) {
    var self = this;

    var _properties = { };

    if(CYIUtilities.isObject(x)) {
        var data = x;
        x = data.x;
        y = data.y;
        width = data.width;
        height = data.height;
    }

    Object.defineProperty(self, "x", {
        enumerable: true,
        get() {
            return _properties.x;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(!Number.isInteger(newValue)) {
                throw CYIUtilities.createError("Invalid rectangle x value: " + CYIUtilities.toString(value));
            }

            _properties.x = newValue;
        }
    });

    Object.defineProperty(self, "y", {
        enumerable: true,
        get() {
            return _properties.y;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(!Number.isInteger(newValue)) {
                throw CYIUtilities.createError("Invalid rectangle y value: " + CYIUtilities.toString(value));
            }

            _properties.y = newValue;
        }
    });

    Object.defineProperty(self, "width", {
        enumerable: true,
        get() {
            return _properties.width;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(!Number.isInteger(newValue) || newValue < 0) {
                throw CYIUtilities.createError("Invalid rectangle width: " + CYIUtilities.toString(value));
            }

            _properties.width = newValue;
        }
    });

    Object.defineProperty(self, "height", {
        enumerable: true,
        get() {
            return _properties.height;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(!Number.isInteger(newValue) || newValue < 0) {
                throw CYIUtilities.createError("Invalid rectangle height: " + CYIUtilities.toString(value));
            }

            _properties.height = newValue;
        }
    });

    self.x = x;
    self.y = y;
    self.width = width;
    self.height = height;
}

CYIRectangle.prototype.toArray = function toArray() {
    var self = this;

    return [self.x, self.y, self.width, self.height];
};

CYIRectangle.prototype.equals = function equals(value) {
    var self = this;

    if(!CYIRectangle.isRectangle(value)) {
        return false;
    }

    return self.x === value.x &&
           self.y === value.y &&
           self.width === value.width &&
           self.height === value.height;
};

CYIRectangle.prototype.toString = function toString() {
    var self = this;

    return "X: " + self.x + " Y: " + self.y + " W: " + self.width + " H: " + self.height;
};

CYIRectangle.isRectangle = function isRectangle(value) {
    return value instanceof CYIRectangle;
};

function CYIVideojsVideoPlayerProperties() {
    var self = this;

    var _properties = {
        instance: null,
        script: null,
        playerVersion: null
    };

    Object.defineProperty(self, "instance", {
        enumerable: true,
        get() {
            return _properties.instance
        },
        set(value) {
            if(CYIUtilities.isInvalid(value)) {
                _properties.instance = null;

                return;
            }

            if(!(value instanceof CYIVideojsVideoPlayer)) {
                return;
            }

            _properties.instance = value;
        }
    });

    Object.defineProperty(self, "script", {
        enumerable: true,
        get() {
            return _properties.script;
        },
        set(value) {
            if(!(value instanceof HTMLScriptElement)) {
                throw CYIUtilities.createError("Invalid HTML script element!");
            }

            _properties.script = value;
        }
    });

    Object.defineProperty(self, "playerVersion", {
        enumerable: true,
        get() {
            return _properties.playerVersion;
        },
        set(value) {
            if(typeof value === "string") {
                _properties.playerVersion = new CYIVideojsVideoPlayerVersion(value);
            }
            else if(CYIVideojsVideoPlayerVersion.isVideoPlayerVersion(value)) {
                _properties.playerVersion = value;
            }
            else {
                throw CYIUtilities.createError("Invalid player version data!");
            }
        }
    });
}

function CYIVideojsVideoPlayer(configuration) {
    var self = this;

    // check for deprecated configuration options
    if(CYIUtilities.isObjectStrict(configuration)) {
        if(CYIUtilities.isValid(configuration.debug)) {
            console.warn("Usage of debug player configuration option is deprecated, use verbose instead.");
        }
    }

    // store private player properties internally and only expose them through getters and setters
    var _properties = {
        streamFormats: [],
        externalTextTrackIdCounter: 1,
        externalTextTrackQueue: []
    };

    Object.defineProperty(self, "state", {
        enumerable: true,
        get() {
            return _properties.state;
        },
        set(value) {
            if(!CYIVideojsVideoPlayerState.isValid(value)) {
                throw CYIUtilities.createError("Invalid video player state!");
            }

            _properties.state = value;
        }
    });

    // create getters and setters for all player instance properties
    Object.defineProperty(self, "streamFormats", {
        enumerable: true,
        get() {
            return _properties.streamFormats;
        }
    });

    Object.defineProperty(self, "initialized", {
        enumerable: true,
        get() {
            return _properties.initialized;
        },
        set(value) {
            _properties.initialized = CYIUtilities.parseBoolean(value, false);
        }
    });

    Object.defineProperty(self, "loaded", {
        enumerable: true,
        get() {
            return _properties.loaded;
        },
        set(value) {
            _properties.loaded = CYIUtilities.parseBoolean(value, false);
        }
    });

    Object.defineProperty(self, "nickname", {
        enumerable: true,
        get() {
            return _properties.nickname;
        },
        set(value) {
            _properties.nickname = CYIUtilities.trimString(value);
        }
    });

    Object.defineProperty(self, "container", {
        enumerable: true,
        get() {
            return _properties.container;
        },
        set(value) {
            if(value instanceof HTMLElement) {
                _properties.container = value;
            }
            else {
                _properties.container = null;
            }
        }
    });

    Object.defineProperty(self, "video", {
        enumerable: true,
        get() {
            return _properties.video;
        },
        set(value) {
            if(value instanceof HTMLVideoElement) {
                _properties.video = value;

                if(CYIUtilities.isValid(_properties.requestedVideoRectangle)) {
                    self.setVideoRectangle(_properties.requestedVideoRectangle);
                }
            }
            else {
                _properties.video = null;
            }
        }
    });

    Object.defineProperty(self, "verbose", {
        enumerable: true,
        get() {
            return _properties.verbose;
        },
        set(value) {
            _properties.verbose = CYIUtilities.parseBoolean(value, false);
        }
    });

    Object.defineProperty(self, "verboseStateChanges", {
        enumerable: true,
        get() {
            return _properties.verboseStateChanges;
        },
        set(value) {
            _properties.verboseStateChanges = CYIUtilities.parseBoolean(value, false);
        }
    });

    Object.defineProperty(self, "streamFormat", {
        enumerable: true,
        get() {
            return _properties.streamFormat;
        },
        set(value) {
            if(CYIUtilities.isInvalid(value)) {
                _properties.streamFormat = null;
            }
            else {
                if(!CYIVideojsVideoPlayerStreamFormat.isValid(value)) {
                    throw CYIUtilities.createError("Invalid stream format: " + JSON.stringify(value));
                }

                _properties.streamFormat = value;
            }
        }
    });

    Object.defineProperty(self, "currentDurationSeconds", {
        enumerable: true,
        get() {
            return _properties.currentDurationSeconds;
        },
        set(value) {
            _properties.currentDurationSeconds = CYIUtilities.parseFloatingPointNumber(value, null);
        }
    });

    Object.defineProperty(self, "initialAudioBitrateKbps", {
        enumerable: true,
        get() {
            return _properties.initialAudioBitrateKbps;
        },
        set(value) {
            _properties.initialAudioBitrateKbps = CYIUtilities.parseInteger(value, null);
        }
    });

    Object.defineProperty(self, "currentAudioBitrateKbps", {
        enumerable: true,
        get() {
            return _properties.currentAudioBitrateKbps;
        },
        set(value) {
            _properties.currentAudioBitrateKbps = CYIUtilities.parseInteger(value, null);
        }
    });

    Object.defineProperty(self, "initialVideoBitrateKbps", {
        enumerable: true,
        get() {
            return _properties.initialVideoBitrateKbps;
        },
        set(value) {
            _properties.initialVideoBitrateKbps = CYIUtilities.parseInteger(value, null);
        }
    });

    Object.defineProperty(self, "currentVideoBitrateKbps", {
        enumerable: true,
        get() {
            return _properties.currentVideoBitrateKbps;
        },
        set(value) {
            _properties.currentVideoBitrateKbps = CYIUtilities.parseInteger(value, null);
        }
    });

    Object.defineProperty(self, "initialTotalBitrateKbps", {
        enumerable: true,
        get() {
            return _properties.initialTotalBitrateKbps;
        },
        set(value) {
            _properties.initialTotalBitrateKbps = CYIUtilities.parseInteger(value, null);
        }
    });

    Object.defineProperty(self, "currentTotalBitrateKbps", {
        enumerable: true,
        get() {
            return _properties.currentTotalBitrateKbps;
        },
        set(value) {
            _properties.currentTotalBitrateKbps = CYIUtilities.parseInteger(value, null);
        }
    });

    Object.defineProperty(self, "requestedVideoRectangle", {
        enumerable: true,
        get() {
            return _properties.requestedVideoRectangle;
        },
        set(value) {
            if(CYIUtilities.isInvalid(value)) {
                _properties.requestedVideoRectangle = null;
            }
            else {
                _properties.requestedVideoRectangle = new CYIRectangle(value);
            }
        }
    });

    Object.defineProperty(self, "shouldResumePlayback", {
        enumerable: true,
        get() {
            return _properties.shouldResumePlayback;
        },
        set(value) {
            _properties.shouldResumePlayback = CYIUtilities.parseBoolean(value, null);
        }
    });

    Object.defineProperty(self, "externalTextTrackQueue", {
        enumerable: true,
        get() {
            return _properties.externalTextTrackQueue;
        }
    });

    Object.defineProperty(self, "player", {
        enumerable: true,
        get() {
            return _properties.player;
        },
        set(value) {
            if(CYIUtilities.isObject(value) && value.constructor.name === "Player") {
                _properties.player = value;
            }
            else {
                _properties.player = null;
            }
        }
    });

    Object.defineProperty(self, "buffering", {
        enumerable: true,
        get() {
            return _properties.buffering;
        },
        set(value) {
            _properties.buffering = CYIUtilities.parseBoolean(value, false);
        }
    });

    Object.defineProperty(self, "requestedTextTrackId", {
        enumerable: true,
        get() {
            return _properties.requestedTextTrackId;
        },
        set(value) {
            var newValue = CYIUtilities.trimString(value);

            if(CYIUtilities.isEmptyString(newValue)) {
                newValue = null;
            }

            _properties.requestedTextTrackId = newValue;
        }
    });

    Object.defineProperty(self, "requestedSeekTimeSeconds", {
        enumerable: true,
        get() {
            return _properties.requestedSeekTimeSeconds;
        },
        set(value) {
            var newValue = CYIUtilities.parseFloatingPointNumber(value);

            if(newValue < 0) {
                newValue = NaN;
            }

            _properties.requestedSeekTimeSeconds = newValue;
        }
    });

    Object.defineProperty(self, "externalTextTrackIdCounter", {
        enumerable: true,
        get() {
            return _properties.externalTextTrackIdCounter;
        },
        set(value) {
            var newValue = CYIUtilities.parseInteger(value);

            if(!isNaN(newValue) && newValue > _properties.externalTextTrackIdCounter) {
                _properties.externalTextTrackIdCounter = newValue;
            }
        }
    });

    // assign default values for all abstract player properties
    self.initialized = false;
    self.state = CYIVideojsVideoPlayer.State.Uninitialized;
    self.loaded = false;
    self.nickname = null;
    self.container = null;
    self.video = null;
    self.verbose = true; // TODO: CYIUtilities.isObjectStrict(configuration) ? CYIUtilities.parseBoolean(configuration.verbose, false) : false;
    self.verboseStateChanges = true; // TODO: false
    self.streamFormat = null;
    self.currentDurationSeconds = null;
    self.initialAudioBitrateKbps = null;
    self.currentAudioBitrateKbps = null;
    self.initialVideoBitrateKbps = null;
    self.currentVideoBitrateKbps = null;
    self.initialTotalBitrateKbps = null;
    self.currentTotalBitrateKbps = null;
    self.shouldResumePlayback = null;
    self.player = null;
    self.requestedTextTrackId = null;
    self.requestedSeekTimeSeconds = NaN;
    self.buffering = false;

    self.registerStreamFormat("DASH", ["PlayReady", "Widevine"]);
    self.registerStreamFormat("HLS", ["PlayReady", "Widevine"]);
    self.registerStreamFormat("MP4");

    self.resetExternalTextTrackIdCounter = function resetExternalTextTrackIdCounter() {
        _properties.externalTextTrackIdCounter = 1;
    };

    document.addEventListener("visibilitychange", function onVisibilityChangeEvent() {
        if(document.hidden) {
            self.suspend();
        }
        else {
            self.restore();
        }
    });

    if(self.verbose) {
        console.log("Created new " + CYIVideojsVideoPlayer.getType() + " " + CYIVideojsVideoPlayer.getVersion() + " player.");
    }
}

CYIVideojsVideoPlayer.createInstance = function createInstance(configuration) {
    if(CYIUtilities.isValid(CYIVideojsVideoPlayer.instance)) {
        throw CYIUtilities.createError("Cannot create more than one " + CYIVideojsVideoPlayer.getType() + " video player instance!");
    }

    CYIVideojsVideoPlayer.instance = new CYIVideojsVideoPlayer(configuration);
};

CYIVideojsVideoPlayer.getInstance = function getInstance() {
    return CYIVideojsVideoPlayer.instance;
};

CYIVideojsVideoPlayer.isExtendedBy = function isExtendedBy(playerClass) {
    if(!(playerClass instanceof Object)) {
        return false;
    }

    var playerClassPrototype = null;

    if(playerClass instanceof Function) {
        playerClassPrototype = playerClass.prototype;
    }
    else {
        playerClassPrototype = playerClass.constructor.prototype;
    }

    return playerClassPrototype instanceof CYIVideojsVideoPlayer;
};

CYIVideojsVideoPlayer.getType = function getType() {
    return "Video.js";
};

CYIVideojsVideoPlayer.getVersion = function getVersion() {
    if(typeof videojs === "undefined") {
        return "Unknown";
    }

    return videojs.VERSION;
};

CYIVideojsVideoPlayer.getVersionData = function getVersionData() {
    if(typeof videojs === "undefined") {
        return "Unknown";
    }

    if(CYIUtilities.isInvalid(CYIVideojsVideoPlayer.playerVersion)) {
        CYIVideojsVideoPlayer.playerVersion = CYIVideojsVideoPlayer.getVersion();
    }

    return CYIVideojsVideoPlayer.playerVersion;
};

CYIVideojsVideoPlayer.generateAudioTrackTitle = function generateAudioTrackTitle(audioTrack, addToTrack) {
    if(!CYIUtilities.isObjectStrict(audioTrack)) {
        return null;
    }

    addToTrack = CYIUtilities.parseBoolean(addToTrack, true);

    var audioTrackTitle = audioTrack.language;

    if(addToTrack) {
        audioTrack.title = audioTrackTitle;
    }

    return audioTrackTitle;
};

CYIVideojsVideoPlayer.generateTextTrackTitle = function generateTextTrackTitle(textTrack, addToTrack) {
    if(!CYIUtilities.isObjectStrict(textTrack)) {
        return null;
    }

    addToTrack = CYIUtilities.parseBoolean(addToTrack, true);

    var textTrackTitle = textTrack.label;

    if(CYIUtilities.isEmptyString(textTrackTitle)) {
        textTrackTitle = textTrack.language;
    }

    if(addToTrack) {
        textTrack.title = textTrackTitle;
    }

    return textTrackTitle;
};

CYIVideojsVideoPlayer.prototype.initialize = function initialize(name) {
    var self = this;

    if(self.state !== CYIVideojsVideoPlayer.State.Uninitialized) {
        throw CYIUtilities.createError(CYIVideojsVideoPlayer.getType() + " player is already initialized!");
    }

    if(CYIPlatformUtilities.isEmbedded) {
        throw CYIUtilities.createError(CYIVideojsVideoPlayer.getType() + " is not supported on embedded platforms!");
    }

    if(typeof videojs === "undefined") {
        throw CYIUtilities.createError(CYIVideojsVideoPlayer.getType() + " player is not loaded yet!");
    }

    if(self.verbose) {
        console.log("Initializing " + CYIVideojsVideoPlayer.getType() + " player...");
    }

    if(self.player) {
        if(self.verbose) {
            console.log(CYIVideojsVideoPlayer.getType() + " player already initialized!");
        }

        return;
    }

    if(CYIUtilities.isValid(name)) {
        self.setNickname(name);
    }

    self.video = document.createElement("video");
    self.video.classList.add("videojs_player");
    self.video.id = "videojs_player";

    if(!CYIPlatformUtilities.isEmbedded) {
        self.video.style.width = "100%";
        self.video.style.height = "100%";
    }

    document.body.appendChild(self.video);

    self.player = videojs(self.video.id, {
        controls: false,
        autoplay: false,
        loadingSpinner: false,
        html5: {
            nativeTextTracks: false,
            nativeAudioTracks: true,
            nativeVideoTracks: false,
            hls: { // applies to DASH as well
                overrideNative: true
            }
        }
    });

    // obtain the new parent container element
    self.container = self.video.parentElement;

    if(!CYIPlatformUtilities.isEmbedded) {
        self.container.style.visibility = "hidden";
        self.container.zIndex = 50;

        self.hideUI();
    }

    if(self.verbose) {
        self.player.log.level("debug");
    }

    self.player.on("ready", function onReadyEvent() {
        if(self.verbose) {
            console.log(self.getDisplayName() + " is ready.");
        }

        self.video = self.player.el().getElementsByTagName("video")[0];
    });

    self.player.on("loadeddata", function onLoadedDataEvent() {
        if(self.verbose) {
            console.log(self.getDisplayName() + " loaded initial data.");
        }

        self.notifyLiveStatus();

        if(Number.isInteger(self.requestedSeekTimeSeconds)) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " processing delayed seek request.");
            }

            var requestedSeekTimeSeconds = self.requestedSeekTimeSeconds;

            self.requestedSeekTimeSeconds = NaN;

            self.seek(requestedSeekTimeSeconds);
        }
    });

    self.player.on("error", function onErrorEvent(event) {
        self.stop();

        var error = CYIUtilities.createError(self.player.error().message);
        error.code = self.player.error().code;
        error.originalMessage = error.message;
        error.message = self.getDisplayName() + " encountered an unexpected error: " + error.originalMessage;

        return self.sendErrorEvent("playerError", error);
    });

    self.player.on("waiting", function onBufferingStartedEvent(event) {
        if(!self.loaded || self.buffering) {
            return;
        }

        self.buffering = true;

        self.notifyBufferingStateChanged(true);
    });

    self.player.on("canplay", function onBufferingStartedEvent(event) {
        if(!self.loaded || !self.buffering) {
            return;
        }

        self.buffering = false;

        self.notifyBufferingStateChanged(false);
    });

    self.player.audioTracks().on("addtrack", function onAudioTrackAddedEvent(event) {
        self.notifyAudioTracksChanged();
    });

    self.player.audioTracks().on("removetrack", function onAudioTrackRemovedEvent(event) {
        self.notifyAudioTracksChanged();
    });

    self.player.audioTracks().on("change", function onAudioTrackChangedEvent(event) {
        self.notifyActiveAudioTrackChanged();
    });

    self.player.textTracks().on("addtrack", function onTextTrackAddedEvent(event) {
        self.notifyTextTracksChanged();
    });

    self.player.textTracks().on("removetrack", function onTextTrackRemovedEvent(event) {
        self.notifyTextTracksChanged();
    });

    self.player.textTracks().on("change", function onTextTrackChangedEvent(event) {
        self.notifyActiveTextTrackChanged();
    });

    self.player.textTracks().on("addtrack", function(event) {
        var textTracks = self.player.textTracks();
        var metadataTextTrack = textTracks[textTracks.length - 1];

        if(CYIUtilities.isInvalid(metadataTextTrack) || metadataTextTrack.kind !== "metadata") {
            return;
        }

        if(self.verbose) {
            console.log("Metadata text track detected, adding cue change listener to monitor for timed metadata events.");
        }

        metadataTextTrack.on("cuechange", function(event) {
            if(metadataTextTrack.activeCues.length === 0) {
                return;
            }

            var activeCue = metadataTextTrack.activeCues[metadataTextTrack.activeCues.length - 1];

            if(CYIUtilities.isEmptyString(activeCue.value.key) || activeCue.value.key === "PRIV") {
                return;
            }

            self.notifyMetadataAvailable({
                identifier: activeCue.value.key,
                value: activeCue.value.data,
                timestamp: new Date(),
                durationMs: (activeCue.endTime - activeCue.startTime) * 1000
            });
        });
    });

    self.player.on("ended", function onVideoEndedEvent(event) {
        // hack to fix multiple ended events being emitted on tizen
        if(self.state === CYIVideojsVideoPlayer.State.Complete) {
            return;
        }

        self.updateState(CYIVideojsVideoPlayer.State.Complete);
    });

    self.player.on("timeupdate", function onTimeUpdateEvent(event) {
        if(!self.player) {
            return;
        }

        self.notifyVideoTimeChanged();
    });

    self.player.on("durationchange", function onDurationChangedEvent(event) {
        if(!self.player) {
            return;
        }

        self.notifyVideoDurationChanged();
    });

    self.player.ready(function() {
        self.initialized = true;

        self.updateState(CYIVideojsVideoPlayer.State.Initialized);

        if(self.verbose) {
            console.log(self.getDisplayName() + " initialized successfully!");
        }
    });
};

CYIVideojsVideoPlayer.prototype.checkInitialized = function checkInitialized() {
    var self = this;

    if(!self.initialized) {
        throw CYIUtilities.createError(self.getDisplayName() + " not initialized!");
    }
};

CYIVideojsVideoPlayer.prototype.getDisplayName = function getDisplayName() {
    var self = this;

    return (self.nickname ? self.nickname + " " : "") + CYIVideojsVideoPlayer.getType() + " player";
};

CYIVideojsVideoPlayer.prototype.getNickname = function getNickname() {
    var self = this;

    return self.nickname;
};

CYIVideojsVideoPlayer.prototype.setNickname = function setNickname(nickname) {
    var self = this;

    var formattedName = CYIUtilities.trimString(nickname);

    if(CYIUtilities.isEmptyString(nickname)) {
        self.nickname = null;

        if(self.verbose) {
            console.log("Removing nickname from " + self.getDisplayName() + ".");
        }
    }
    else {
        if(self.verbose) {
            console.log("Changing " + self.getDisplayName() + " nickname to " + formattedName + ".");
        }

        self.nickname = formattedName;
    }
};

CYIVideojsVideoPlayer.prototype.getPosition = function getPosition() {
    var self = this;

    self.checkInitialized();

    // retrieve the player container / video element absolute position by converting the values from pixel strings to integers
    var position = {
        x: CYIUtilities.parseInteger(self.container.style.left.substring(0, self.container.style.left.length - 2)),
        y: CYIUtilities.parseInteger(self.container.style.top.substring(0, self.container.style.top.length - 2))
    };

    if(!Number.isInteger(position.x) || !Number.isInteger(position.y)) {
        return null;
    }

    return position;
};

CYIVideojsVideoPlayer.prototype.getSize = function getSize() {
    var self = this;

    self.checkInitialized();

    if(CYIUtilities.isInvalid(self.container)) {
        throw CYIUtilities.createError(self.getDisplayName() + " video element is not initialized!");
    }

    // retrieve the player container / video element's width and height by converting the values from pixel strings to integers
    var size = {
        width: CYIUtilities.parseInteger(self.container.style.width.substring(0, self.container.style.width.length - 2)),
        height: CYIUtilities.parseInteger(self.container.style.height.substring(0, self.container.style.height.length - 2))
    };

    if(!Number.isInteger(size.width) || !Number.isInteger(size.height)) {
        return null;
    }

    return size;
};

CYIVideojsVideoPlayer.prototype.isVerbose = function isVerbose() {
    var self = this;

    return self.verbose;
};

CYIVideojsVideoPlayer.prototype.setVerbose = function setVerbose(verbose) {
    var self = this;

    self.verbose = verbose;
};

CYIVideojsVideoPlayer.prototype.getState = function getState() {
    var self = this;

    return self.state;
};

CYIVideojsVideoPlayer.prototype.updateState = function updateState(state) {
    var self = this;

    var previousState = self.state;

    if(!CYIVideojsVideoPlayerState.isValid(state)) {
        throw CYIUtilities.createError(self.getDisplayName() + " tried to transition to invalid state!");
    }

    if(!self.state.canTransitionTo(state)) {
        throw CYIUtilities.createError(self.getDisplayName() + " tried to incorrectly transition from " + previousState.displayName + " to " + state.displayName + ".");
    }

    self.state = state;

    self.sendEvent("stateChanged", self.state.id);

    if(self.verbose && self.verboseStateChanges) {
        console.log(self.getDisplayName() + " transitioned from " + previousState.displayName + " to " + state.displayName + ".");
    }
};

CYIVideojsVideoPlayer.prototype.setVideoRectangle = function setVideoRectangle(x, y, width, height) {
    var self = this;

    if(CYIUtilities.isObject(x)) {
        var data = x;
        x = data.x;
        y = data.y;
        width = data.width;
        height = data.height;
    }

    if(CYIUtilities.isInvalid(self.container) || CYIUtilities.isInvalid(self.video)) {
        self.requestedVideoRectangle = new CYIRectangle(x, y, width, height);
        return;
    }

    var formattedXPosition = CYIUtilities.parseInteger(x);
    var formattedYPosition = CYIUtilities.parseInteger(y);
    var formattedWidth = CYIUtilities.parseInteger(width);
    var formattedHeight = CYIUtilities.parseInteger(height);

    if(!Number.isInteger(formattedXPosition)) {
        throw CYIUtilities.createError(self.getDisplayName() + " received an invalid x position for the video rectangle: " + x);
    }

    if(!Number.isInteger(formattedYPosition)) {
        throw CYIUtilities.createError(self.getDisplayName() + " received an invalid y position for the video rectangle: " + y);
    }

    if(!Number.isInteger(formattedWidth) || formattedWidth < 0) {
        throw CYIUtilities.createError(self.getDisplayName() + " received an invalid width for the video rectangle: " + width);
    }

    if(!Number.isInteger(formattedHeight) || formattedHeight < 0) {
        throw CYIUtilities.createError(self.getDisplayName() + " received an invalid height for the video rectangle: " + height);
    }

    self.container.style.position = "absolute";
    self.container.style.left = formattedXPosition + "px";
    self.container.style.top = formattedYPosition + "px";
    self.container.style.width = formattedWidth + "px";
    self.container.style.height = formattedHeight + "px";

    if(self.container !== self.video) {
        self.video.style.width = self.container.style.width;
        self.video.style.height = self.container.style.height;
    }

    self.requestedVideoRectangle = null;
};

CYIVideojsVideoPlayer.prototype.hideUI = function hideUI() {
    var self = this;

    if(CYIUtilities.isInvalid(self.container)) {
        return;
    }

    // hide all child elements excluding the video element and text track display
    for(var i = 0; i < self.container.childNodes.length; i++) {
        var node = self.container.childNodes[i];

        if(node.tagName.toLowerCase() === "video" || node.classList.contains(CYIVideojsVideoPlayer.TextTrackDisplayClassName)) {
            continue;
        }

        node.style.display = "none";
    }
};

CYIVideojsVideoPlayer.prototype.configureDRM = function configureDRM(drmConfiguration) {
    var self = this;

    self.checkInitialized();

    var videojsPlugins = videojs.getPlugins();

    if(CYIUtilities.isInvalid(videojsPlugins.eme)) {
        throw CYIUtilities.createError(CYIVideojsVideoPlayer.getType() + " is missing encrypted media extensions plugin!");
    }

    if(!self.isPaused()) {
        throw CYIUtilities.createError(self.getDisplayName() + " cannot configure DRM after playback has been initiated.");
    }

    var emeOptions = { };

    if(CYIUtilities.isValid(drmConfiguration)) {
        if(!CYIUtilities.isObjectStrict(drmConfiguration)) {
            throw CYIUtilities.createError(self.getDisplayName() + " requires a valid DRM configuration object.");
        }

        if(CYIUtilities.isNonEmptyObject(drmConfiguration)) {
            // initialize videojs-contrib-eme plugin
            self.player.eme();

            emeOptions.keySystems = { };

            if(CYIUtilities.isNonEmptyString(drmConfiguration.url)) {
                if(CYIUtilities.isNonEmptyString(drmConfiguration.type)) {
                    var formattedDrmType = drmConfiguration.type.trim().toLowerCase();
                    var drmKey = CYIVideojsVideoPlayer.DRMKeys[formattedDrmType];

                    if(CYIUtilities.isNonEmptyString(drmKey)) {
                        var keySystemConfiguration = {
                            url: drmConfiguration.url
                        };

                        if(CYIUtilities.isNonEmptyObject(drmConfiguration.headers)) {
                            keySystemConfiguration.licenseHeaders = drmConfiguration.headers;
                        }

                        emeOptions.keySystems[drmKey] = keySystemConfiguration;
                    }
                    else {
                        throw CYIUtilities.createError(self.getDisplayName() + " tried to configure the player with an unsupported DRM type: " + drmConfiguration.type);
                    }
                }
                else {
                    throw CYIUtilities.createError(self.getDisplayName() + " tried to configure the player without a DRM type specified.");
                }
            }
        }
    }

    if(CYIUtilities.isNonEmptyObject(emeOptions)) {
        self.player.eme.initializeMediaKeys(
            emeOptions,
            function(error) {
                if(error) {
                    var newError = CYIVideojsVideoPlayer.formatError(error);
                    newError.originalMessage = newError.message;
                    newError.message = self.getDisplayName() + " failed to configure DRM with error: " + newError.message;
                    throw newError;
                }

                if(self.verbose) {
                    console.log(self.getDisplayName() + " DRM successfully configured.");
                }
            },
            true // suppressErrorsIfPossible
        );
    }
};

CYIVideojsVideoPlayer.prototype.prepare = function prepare(url, format, startTimeSeconds, maxBitrateKbps, drmConfiguration) {
    var self = this;

    self.checkInitialized();

    if(CYIUtilities.isObjectStrict(url)) {
        var data = url;
        url = data.url;
        format = data.format;
        startTimeSeconds = data.startTimeSeconds;
        maxBitrateKbps = data.maxBitrateKbps;
        drmConfiguration = data.drmConfiguration;
    }

    if(!self.isStreamFormatSupported(format, CYIUtilities.isObjectStrict(drmConfiguration) ? drmConfiguration.type : null)) {
        throw CYIUtilities.createError(CYIVideojsVideoPlayer.name + " does not support " + format + " stream formats" + (CYIUtilities.isObjectStrict(drmConfiguration) ? " with " + drmConfiguration.type + " DRM." : "."));
    }

    self.updateState(CYIVideojsVideoPlayer.State.Loading);

    if(CYIUtilities.isValid(self.streamFormat)) {
        self.streamFormat.format = format;
    }
    else {
        self.streamFormat = new CYIVideojsVideoPlayer.StreamFormat(format);
    }

    startTimeSeconds = CYIUtilities.parseFloatingPointNumber(startTimeSeconds, 0);

    if(startTimeSeconds < 0) {
        startTimeSeconds = 0;

        console.warn(self.getDisplayName() + " tried to prepare a video with a negative start time.");
    }

    if(CYIUtilities.isEmptyString(url)) {
        throw CYIUtilities.createError(self.getDisplayName() + " requires a non-empty url string to load when preparing.");
    }

    if(CYIUtilities.isValid(maxBitrateKbps)) {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " does not support setting a maximum bitrate.");
        }
    }

    self.configureDRM(drmConfiguration);

    if(!CYIPlatformUtilities.isEmbedded) {
        self.container.style.visibility = "visible";
    }

    var sourceConfiguration = {
        src: url
    };

    if(CYIUtilities.isNonEmptyString(self.streamFormat.format)) {
        sourceConfiguration.type = CYIVideojsVideoPlayer.FormatMimeTypes[self.streamFormat.format.toLowerCase()]
    }

    if(startTimeSeconds > 0) {
        self.player.currentTime(startTimeSeconds);
    }

    self.player.src(sourceConfiguration);

    self.loaded = true;

    self.updateState(CYIVideojsVideoPlayer.State.Loaded);

    self.processExternalTextTrackQueue();
};

CYIVideojsVideoPlayer.prototype.isPlaying = function isPlaying() {
    var self = this;

    self.checkInitialized();

    return !self.player.paused();
};

CYIVideojsVideoPlayer.prototype.isPaused = function isPaused() {
    var self = this;

    self.checkInitialized();

    return self.player.paused();
};

CYIVideojsVideoPlayer.prototype.play = function play() {
    var self = this;

    self.checkInitialized();

    if(!self.isPaused()) {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " tried to start playback, but video is already playing.");
        }

        return;
    }

    if(!self.loaded) {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " tried to play while media is not loaded.");
        }

        return;
    }

    self.player.play();

    self.updateState(CYIVideojsVideoPlayer.State.Playing);

    if(self.verbose) {
        console.log(self.getDisplayName() + " playing.");
    }
};

CYIVideojsVideoPlayer.prototype.pause = function pause() {
    var self = this;

    self.checkInitialized();

    if(self.isPaused()) {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " tried to pause playback, but video is already paused.");
        }

        return;
    }

    if(!self.loaded) {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " tried to pause while media is not loaded.");
        }

        return;
    }

    self.player.pause();

    self.updateState(CYIVideojsVideoPlayer.State.Paused);

    if(self.verbose) {
        console.log(self.getDisplayName() + " paused.");
    }
};

CYIVideojsVideoPlayer.prototype.stop = function stop() {
    var self = this;

    if(!self.initialized) {
        return;
    }

    // store the last known player position and size so that it can be used if the player is re-initialized later
    var playerPosition = self.getPosition();
    var playerSize = self.getSize();

    if(CYIUtilities.isValid(playerPosition) && CYIUtilities.isValid(playerSize)) {
        self.requestedVideoRectangle = new CYIRectangle(playerPosition.x, playerPosition.y, playerSize.width, playerSize.height);
    }

    // hide and reset the player
    if(!CYIPlatformUtilities.isEmbedded) {
        self.container.style.visibility = "hidden";
    }

    self.player.reset();

    self.loaded = false;
    self.buffering = false;
    self.shouldResumePlayback = null;
    self.requestedTextTrackId = null;
    self.requestedSeekTimeSeconds = NaN;
    self.externalTextTrackQueue.length = 0;

    self.resetExternalTextTrackIdCounter();

    if(self.state !== CYIVideojsVideoPlayer.State.Initialized) {
        self.updateState(CYIVideojsVideoPlayer.State.Initialized);
    }

    if(self.verbose) {
        console.log(self.getDisplayName() + " stopped.");
    }
};

CYIVideojsVideoPlayer.prototype.suspend = function suspend() {
    var self = this;

    if(!self.initialized || !self.loaded) {
        return;
    }

    if(!self.isPaused()) {
        self.shouldResumePlayback = true;

        self.pause();
    }

    if(self.verbose) {
        console.log(self.getDisplayName() + " suspended" + (self.shouldResumePlayback ? ", will resume playback on restore" : "") + ".");
    }
};

CYIVideojsVideoPlayer.prototype.restore = function restore() {
    var self = this;

    if(!self.initialized || !self.loaded) {
        return;
    }

    if(self.shouldResumePlayback) {
        if(self.isPaused()) {
            if(self.verbose) {
                console.log(self.getDisplayName() + " resuming playback after restore.");
            }

            self.play();
        }

        self.shouldResumePlayback = false;
    }

    if(self.verbose) {
        console.log(self.getDisplayName() + " restored.");
    }
};

CYIVideojsVideoPlayer.prototype.destroy = function destroy() {
    var self = this;

    if(!self.player) {
        return;
    }

    self.stop();
    self.state = CYIVideojsVideoPlayer.State.Uninitialized;

    self.player.dispose();

    self.player = null;
    self.initialized = false;
    self.video = null;
    self.container = null;

    if(self.verbose) {
        console.log(self.getDisplayName() + " disposed.");
    }
};

CYIVideojsVideoPlayer.prototype.getCurrentTime = function getCurrentTime() {
    var self = this;

    self.checkInitialized();

    return self.player.currentTime();
};

CYIVideojsVideoPlayer.prototype.getDuration = function getDuration() {
    var self = this;

    self.checkInitialized();

    if(CYIUtilities.isInvalidNumber(self.player.duration())) {
        return -1;
    }

    return self.player.duration();
};

CYIVideojsVideoPlayer.prototype.seek = function seek(timeSeconds) {
    var self = this;

    self.checkInitialized();

    if(CYIUtilities.isInvalidNumber(timeSeconds)) {
        return;
    }

    if(isNaN(self.player.duration())) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " tried to seek before player is ready, delaying seek.");
        }

        self.requestedSeekTimeSeconds = timeSeconds;

        return;
    }

    self.player.currentTime(CYIUtilities.clamp(timeSeconds, 0, self.player.duration()));

    if(self.verbose) {
        console.log(self.getDisplayName() + " seeked to " + timeSeconds + "s.");
    }

    self.notifyVideoTimeChanged();
};

CYIVideojsVideoPlayer.prototype.isMuted = function isMuted() {
    var self = this;

    self.checkInitialized();

    return self.player.muted();
};

CYIVideojsVideoPlayer.prototype.mute = function mute() {
    var self = this;

    self.checkInitialized();

    if(self.player.muted()) {
        return;
    }

    self.player.muted(true);

    if(self.verbose) {
        console.log(self.getDisplayName() + " muted.");
    }
};

CYIVideojsVideoPlayer.prototype.unmute = function unmute() {
    var self = this;

    self.checkInitialized();

    if(!self.player.muted()) {
        return;
    }

    self.player.muted(false);

    if(self.verbose) {
        console.log(self.getDisplayName() + " unmuted.");
    }
};

CYIVideojsVideoPlayer.prototype.setMaxBitrate = function setMaxBitrate(maxBitrateKbps) {
    var self = this;

    if(self.verbose) {
        console.warn(self.getDisplayName() + " does not support setting a maximum bitrate.");
    }
};

CYIVideojsVideoPlayer.prototype.isLive = function isLive() {
    var self = this;

    self.checkInitialized();

    return self.player.liveTracker.isLive();
};

CYIVideojsVideoPlayer.prototype.getActiveAudioTrack = function getActiveAudioTrack() {
    var self = this;

    self.checkInitialized();

    var audioTrack = null;
    var audioTracks = self.player.audioTracks();
    var formattedAudioTrack = null;

    for(var i = 0; i < audioTracks.length; i++) {
        audioTrack = audioTracks[i];

        if(!audioTrack.enabled) {
            continue;
        }

        formattedAudioTrack = {
            id: i,
            originalId: audioTrack.id,
            kind: audioTrack.kind,
            label: audioTrack.label,
            language: audioTrack.language,
            active: audioTrack.enabled
        };

        CYIVideojsVideoPlayer.generateAudioTrackTitle(formattedAudioTrack);

        return formattedAudioTrack;
    }

    return null;
};

CYIVideojsVideoPlayer.prototype.getAudioTracks = function getAudioTracks() {
    var self = this;

    self.checkInitialized();

    var audioTrack = null;
    var audioTracks = self.player.audioTracks();
    var formattedAudioTrack = null;
    var formattedAudioTracks = [];

    for(var i = 0; i < audioTracks.length; i++) {
        audioTrack = audioTracks[i];

        formattedAudioTrack = {
            id: i,
            originalId: audioTrack.id,
            kind: audioTrack.kind,
            label: audioTrack.label,
            language: audioTrack.language,
            active: audioTrack.enabled
        };

        CYIVideojsVideoPlayer.generateAudioTrackTitle(formattedAudioTrack);

        formattedAudioTracks.push(formattedAudioTrack);
    }

    return formattedAudioTracks;
};

CYIVideojsVideoPlayer.prototype.selectAudioTrack = function selectAudioTrack(id) {
    var self = this;

    self.checkInitialized();

    var audioTracks = self.player.audioTracks();

    if(audioTracks.length === 0) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " has no audio tracks.");
        }

        return;
    }

    var formattedAudioTrackId = CYIUtilities.parseInteger(id);

    if(CYIUtilities.isInvalidNumber(formattedAudioTrackId) || formattedAudioTrackId < 0 || formattedAudioTrackId >= audioTracks.length) {
        throw CYIUtilities.createError(self.getDisplayName() + " tried to select an audio track using an invalid number: " + id);
    }

    var activeAudioTrack = self.getActiveAudioTrack();

    if(CYIUtilities.isValid(activeAudioTrack) && activeAudioTrack.id === formattedAudioTrackId) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " tried to select audio track #" + formattedAudioTrackId + " with id: " + activeAudioTrack.originalId + ", but it is already active.");
        }

        return true;
    }

    var selectedAudioTrack = audioTracks[formattedAudioTrackId];

    if(CYIUtilities.isInvalid(selectedAudioTrack)) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " tried to select audio track #" + formattedAudioTrackId + ", but it does not exist.");
        }

        return false;
    }

    selectedAudioTrack.enabled = true;

    if(self.verbose) {
        console.log(self.getDisplayName() + " selected audio track #" + formattedAudioTrackId + " with id: " + selectedAudioTrack.id + ".")
    }

    return false;
};

CYIVideojsVideoPlayer.prototype.hasTextTracks = function hasTextTracks() {
    var self = this;

    self.checkInitialized();

    var textTrack = null;
    var textTracks = self.player.textTracks();

    for(var i = 0; i < textTracks.length; i++) {
        textTrack = textTracks[i];

        if(textTrack.kind === "subtitles" || textTrack.kind === "captions") {
            return true;
        }
    }

    return false;
};

CYIVideojsVideoPlayer.prototype.isTextTrackEnabled = function isTextTrackEnabled() {
    var self = this;

    self.checkInitialized();

    var textTrack = null;
    var textTracks = self.player.textTracks();

    for(var i = 0; i < textTracks.length; i++) {
        textTrack = textTracks[i];

        if(textTrack.kind !== "subtitles" && textTrack.kind !== "captions") {
            continue;
        }

        if(textTrack.mode === "showing") {
            return true;
        }
    }

    return false;
};

CYIVideojsVideoPlayer.prototype.enableTextTrack = function enableTextTrack() {
    var self = this;

    self.checkInitialized();

    if(!self.hasTextTracks()) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " has no text tracks.");
        }

        return;
    }

    // check if any text tracks are already visible
    if(self.isTextTrackEnabled()) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " already has a text track enabled.");
        }

        return;
    }

    var textTrack = null;
    var textTracks = self.player.textTracks();

    // if a previous text track was enavled, try to re-enable it
    if(CYIUtilities.isNonEmptyString(self.requestedTextTrackId)) {
        for(var i = 0; i < textTracks.length; i++) {
            textTrack = textTracks[i];

            if(textTrack.kind !== "subtitles" && textTrack.kind !== "captions") {
                continue;
            }

            if(textTrack.id === self.requestedTextTrackId) {
                textTrack.mode = "showing";

                if(self.verbose) {
                    console.log(self.getDisplayName() + " enabled text track #" + i + " with id: " + self.requestedTextTrackId + ".");
                }

                return;
            }
        }
    }

    // otherwise, activate the first non-visible text track, if any exist
    for(var i = 0; i < textTracks.length; i++) {
        var textTrack = textTracks[i];

        if(textTrack.kind !== "subtitles" && textTrack.kind !== "captions") {
            continue;
        }

        if(textTrack.mode !== "disabled") {
            continue;
        }

        self.requestedTextTrackId = textTrack.id;

        textTrack.mode = "showing";

        if(self.verbose) {
            console.log(self.getDisplayName() + " enabled text track #" + i + " with id: " + textTrack.id + (CYIUtilities.isNonEmptyString(textTrack.language) ? " (" + textTrack.language + ")" : "") + ".");
        }

        break;
    }
};

CYIVideojsVideoPlayer.prototype.disableTextTrack = function disableTextTrack() {
    var self = this;

    return self.disableActiveTextTracks();
};

CYIVideojsVideoPlayer.prototype.disableActiveTextTracks = function disableActiveTextTracks() {
    var self = this;

    self.checkInitialized();

    var textTrackDisabled = false;
    var textTrack = null;
    var textTracks = self.player.textTracks();

    if(!self.hasTextTracks()) {
        return;
    }

    for(var i = 0; i < textTracks.length; i++) {
        textTrack = textTracks[i];

        if(textTrack.kind !== "subtitles" && textTrack.kind !== "captions") {
            continue;
        }

        if(textTrack.mode === "showing") {
            textTrack.mode = "disabled";

            textTrackDisabled = true;

            if(self.verbose) {
                console.log(self.getDisplayName() + " disabled text track #" + i + " with id: " + textTrack.id + (CYIUtilities.isNonEmptyString(textTrack.language) ? " (" + textTrack.language + ")" : "") + ".");
            }
        }
    }

    if(textTrackDisabled) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " active text tracks disabled.");
        }
    }
};

CYIVideojsVideoPlayer.prototype.getActiveTextTrack = function getActiveTextTrack() {
    var self = this;

    self.checkInitialized();

    var textTrack = null;
    var textTracks = self.player.textTracks();
    var formattedTextTrack = null;

    for(var i = 0; i < textTracks.length; i++) {
        textTrack = textTracks[i];

        if(textTrack.kind !== "subtitles" && textTrack.kind !== "captions") {
            continue;
        }

        if(textTrack.mode === "showing") {
            formattedTextTrack = {
                id: i,
                originalId: textTrack.id,
                kind: textTrack.kind,
                mode: textTrack.mode,
                label: textTrack.label,
                language: textTrack.language,
                default: textTrack.default,
                src: textTrack.src,
                srclang: textTrack.srclang,
                active: textTrack.mode === "showing"
            };

            CYIVideojsVideoPlayer.generateTextTrackTitle(formattedTextTrack);

            return formattedTextTrack;
        }
    }

    return null;
};

CYIVideojsVideoPlayer.prototype.getTextTracks = function getTextTracks() {
    var self = this;

    var textTrack = null;
    var textTracks = self.player.textTracks();
    var formattedTextTrack = null;
    var formattedTextTracks = [];

    for(var i = 0; i < textTracks.length; i++) {
        textTrack = textTracks[i];

        if(textTrack.kind !== "subtitles" && textTrack.kind !== "captions") {
            continue;
        }

        formattedTextTrack = {
            id: i,
            originalId: textTrack.id,
            kind: textTrack.kind,
            mode: textTrack.mode,
            label: textTrack.label,
            language: textTrack.language,
            default: textTrack.default,
            src: textTrack.src,
            srclang: textTrack.srclang,
            active: textTrack.mode === "showing"
        };

        CYIVideojsVideoPlayer.generateTextTrackTitle(formattedTextTrack);

        formattedTextTracks.push(formattedTextTrack);
    }

    return formattedTextTracks;
};

CYIVideojsVideoPlayer.prototype.selectTextTrack = function selectTextTrack(id, enable) {
    var self = this;

    self.checkInitialized();

    if(!self.hasTextTracks()) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " has no text tracks.");
        }

        return false;
    }

    var textTracks = self.player.textTracks();
    var formattedTextTrackId = CYIUtilities.parseInteger(id);

    if(CYIUtilities.isInvalidNumber(formattedTextTrackId) || formattedTextTrackId < 0 || formattedTextTrackId >= textTracks.length) {
        throw CYIUtilities.createError(self.getDisplayName() + " tried to select a text track using an invalid id: " + id);
    }

    var trackActivated = false;
    var activeTextTrack = self.getActiveTextTrack();
    var selectedTextTrack = textTracks[formattedTextTrackId];

    if(CYIUtilities.isObject(activeTextTrack) && activeTextTrack.id === formattedTextTrackId) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " tried to select text track #" + activeTextTrack.id + " with id: " + formattedTextTrackId + ", but it is already active.");
        }

        return true;
    }
    else if(CYIUtilities.isInvalid(selectedTextTrack)) {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " could not find a text track with id: " + formattedTextTrackId);
        }

        return false;
    }
    else if(selectedTextTrack.kind !== "subtitles" && selectedTextTrack.kind !== "captions") {
        if(self.verbose) {
            console.warn(self.getDisplayName() + " could not select text track with kind: " + selectedTextTrack.kind);
        }

        return false;
    }
    else if(selectedTextTrack.mode === "showing") {
        if(self.verbose) {
            console.log(self.getDisplayName() + " tried to select text track #" + activeTextTrack.id + " with id: " + formattedTextTrackId + ", but it is already active.");
        }

        return true;
    }
    else {
        self.disableActiveTextTracks();

        self.requestedTextTrackId = selectedTextTrack.id;

        selectedTextTrack.mode = "showing";

        if(self.verbose) {
            console.log(self.getDisplayName() + " selected text track #" + formattedTextTrackId + " with id: " + selectedTextTrack.id + (CYIUtilities.isNonEmptyString(selectedTextTrack.language) ? " (" + selectedTextTrack.language + ")." : ""));
        }

        return true;
    }
};

CYIVideojsVideoPlayer.prototype.addExternalTextTrack = function addExternalTextTrack(url, language, label, type, format, enable) {
    var self = this;

    self.checkInitialized();

    if(CYIUtilities.isObjectStrict(url)) {
        var data = url;
        url = data.url;
        language = data.language;
        label = data.label;
        type = data.type;
        format = data.format;
        enable = data.enable;
    }

    url = CYIUtilities.trimString(url);
    language = CYIUtilities.trimString(language);
    label = CYIUtilities.trimString(label, "");
    format = CYIUtilities.trimString(format);
    type = CYIUtilities.trimString(type);
    enable = CYIUtilities.parseBoolean(enable, true);

    if(CYIUtilities.isEmptyString(url)) {
        throw CYIUtilities.createError(self.getDisplayName() + " missing or invalid external text track url value.");
    }

    if(CYIUtilities.isEmptyString(language)) {
        throw CYIUtilities.createError(self.getDisplayName() + " missing or invalid external text track language value.");
    }

    if(CYIUtilities.isEmptyString(format)) {
        throw CYIUtilities.createError(self.getDisplayName() + " missing or invalid external text track format value.");
    }

    if(CYIUtilities.isEmptyString(type)) {
        type = "captions";

        console.warn(self.getDisplayName() + " missing or invalid external text track type value, defaulting to caption.");
    }

    if(!self.loaded) {
        self.externalTextTrackQueue.push({
            url: url,
            language: language,
            label: label,
            type: type,
            format: format,
            enable: enable
        });

        return console.warn(self.getDisplayName() + " tried to add an external text track before video finished loading, storing in queue to add after the video has loaded.");
    }

    var generatedExternalTextTrackId = CYIVideojsVideoPlayer.ExternalTrackPrefix + self.externalTextTrackIdCounter++;

    var textTrackElement = self.player.addRemoteTextTrack(
        {
            id: generatedExternalTextTrackId,
            kind: type,
            mode: enable ? "showing" : "disabled",
            label: label,
            language: language,
            src: url
        },
        true // manualCleanup
    );

    textTrackElement.on("load", function() {
        if(self.verbose) {
            console.log(self.getDisplayName() + " loaded " + (enable ? "and enabled " : "") + "external text track with id: \"" + generatedExternalTextTrackId + "\".");
        }

        var textTrack = null;
        var textTracks = self.player.textTracks();

        for(var i = 0; i < textTracks.length; i++) {
            textTrack = textTracks[i];

            if(textTrack.id !== generatedExternalTextTrackId) {
                continue;
            }

            var formattedTextTrack = {
                id: i,
                originalId: textTrack.id,
                kind: textTrack.kind,
                mode: textTrack.mode,
                label: textTrack.label,
                language: textTrack.language,
                default: textTrack.default,
                src: textTrack.src,
                srclang: textTrack.srclang,
                active: textTrack.mode === "showing"
            };

            CYIVideojsVideoPlayer.generateTextTrackTitle(formattedTextTrack);

            self.sendEvent("externalTextTrackAdded", formattedTextTrack);
        }
    });
};

CYIVideojsVideoPlayer.prototype.processExternalTextTrackQueue = function processExternalTextTrackQueue() {
    var self = this;

    self.checkInitialized();

    if(!self.loaded || self.externalTextTrackQueue.length === 0) {
        return;
    }

    if(self.verbose) {
        console.log(self.getDisplayName() + " processing external text track queue...");
    }

    for(var i = 0; i < self.externalTextTrackQueue.length; i++) {
        if(self.verbose) {
            console.log(self.getDisplayName() + " adding external text track " + (i + 1) + " / " + self.externalTextTrackQueue.length + "...");
        }

        self.addExternalTextTrack(self.externalTextTrackQueue[i]);
    }

    self.externalTextTrackQueue.length = 0;
};

CYIVideojsVideoPlayer.prototype.numberOfStreamFormats = function numberOfStreamFormats() {
    var self = this;

    return self.streamFormats.length;
};

CYIVideojsVideoPlayer.prototype.hasStreamFormat = function hasStreamFormat(streamFormat) {
    var self = this;

    return self.indexOfStreamFormat() !== -1;
};

CYIVideojsVideoPlayer.prototype.indexOfStreamFormat = function indexOfStreamFormat(streamFormat) {
    var self = this;

    var formattedStreamFormat = null;

    if(CYIVideojsVideoPlayerStreamFormat.isStreamFormat(streamFormat) || CYIUtilities.isObjectStrict(streamFormat)) {
        formattedStreamFormat = CYIUtilities.trimString(streamFormat.format);
    }
    else if(CYIUtilities.isNonEmptyString(streamFormat)) {
        formattedStreamFormat = CYIUtilities.trimString(streamFormat);
    }

    if(CYIUtilities.isEmptyString(formattedStreamFormat)) {
        return -1;
    }

    for(var i = 0; i < self.streamFormats.length; i++) {
        if(CYIUtilities.equalsIgnoreCase(self.streamFormats[i].format, formattedStreamFormat)) {
            return i;
        }
    }

    return -1;
};

CYIVideojsVideoPlayer.prototype.getStreamFormat = function getStreamFormat(streamFormat) {
    var self = this;

    var streamFormatIndex = self.indexOfStreamFormat(streamFormat);

    if(streamFormatIndex === -1) {
        return null;
    }

    return self.streamFormats[streamFormatIndex];
};

CYIVideojsVideoPlayer.prototype.registerStreamFormat = function registerStreamFormat(streamFormat, drmTypes) {
    var self = this;

    var streamFormatInfo = null;

    if(CYIVideojsVideoPlayerStreamFormat.isStreamFormat(streamFormat)) {
        streamFormatInfo = streamFormat;
    }
    else {
        var formattedStreamFormat = CYIUtilities.trimString(streamFormat);

        if(CYIUtilities.isEmptyString(formattedStreamFormat)) {
            console.error(CYIVideojsVideoPlayer.name + " cannot register stream format with empty or invalid format.");
            return null;
        }

        var formattedDRMTypes = [];

        if(CYIUtilities.isNonEmptyArray(drmTypes)) {
            for(var i = 0; i < drmTypes.length; i++) {
                var formattedDRMType = CYIUtilities.trimString(drmTypes[i]);

                if(CYIUtilities.isEmptyString(formattedDRMType)) {
                    console.error(CYIVideojsVideoPlayer.name + " skipping registration of empty or invalid DRM type for " + formattedStreamFormat + " stream format.");
                    continue;
                }

                for(var j = 0; j < formattedDRMTypes.length; j++) {
                    if(CYIUtilities.equalsIgnoreCase(formattedDRMTypes[j], formattedDRMType)) {
                        console.warn(CYIVideojsVideoPlayer.name + " already has " + formattedDRMType + " DRM type registered for " + formattedStreamFormat + " stream format.");
                        continue;
                    }
                }

                if(!CYIPlatformUtilities.isDRMTypeSupported(formattedDRMType)) {
                    continue;
                }

                formattedDRMTypes.push(formattedDRMType);
            }
        }

        streamFormatInfo = new CYIVideojsVideoPlayerStreamFormat(formattedStreamFormat, formattedDRMTypes);
    }

    if(!streamFormatInfo.isValid()) {
        console.error(CYIVideojsVideoPlayer.name + " tried to register an invalid stream format!");
        return null;
    }

    var registeredStreamFormat = self.getStreamFormat(streamFormatInfo);

    if(CYIUtilities.isValid(registeredStreamFormat)) {
        console.warn(CYIVideojsVideoPlayer.name + " already has " + registeredStreamFormat.format + " stream format registered!");
        return null;
    }

    self.streamFormats.push(streamFormatInfo);

    return streamFormatInfo;
};

CYIVideojsVideoPlayer.prototype.unregisterStreamFormat = function unregisterStreamFormat(streamFormat) {
    var self = this;

    var streamFormatIndex = self.indexOfStreamFormat(streamFormat);

    if(streamFormatIndex === -1) {
        return false;
    }

    return self.streamFormats.splice(streamFormatIndex, 1);
};

CYIVideojsVideoPlayer.prototype.addDRMTypeToStreamFormat = function addDRMTypeToStreamFormat(streamFormat, drmType) {
    var self = this;

    var streamFormatInfo = self.getStreamFormat(streamFormat);

    if(!CYIVideojsVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
        return false;
    }

    return streamFormatInfo.addDRMType(drmType);
};

CYIVideojsVideoPlayer.prototype.removeDRMTypeFromStreamFormat = function removeDRMTypeFromStreamFormat(streamFormat, drmType) {
    var self = this;

    var streamFormatInfo = self.getStreamFormat(streamFormat);

    if(!CYIVideojsVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
        return false;
    }

    return streamFormatInfo.removeDRMType(drmType);
};

CYIVideojsVideoPlayer.prototype.removeAllDRMTypesFromStreamFormat = function removeAllDRMTypesFromStreamFormat(streamFormat) {
    var self = this;

    var streamFormatInfo = self.getStreamFormat(streamFormat);

    if(!CYIVideojsVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
        return false;
    }

    streamFormatInfo.clearDRMTypes();

    return true;
};

CYIVideojsVideoPlayer.prototype.isStreamFormatSupported = function isStreamFormatSupported(streamFormat, drmType) {
    var self = this;

    if(CYIUtilities.isNonEmptyString(drmType)) {
        if(CYIPlatformUtilities.isTizen && CYIUtilities.compareVersions(CYIPlatformUtilities.tizenPlatformVersion, "2.4" <= 0)) {
            console.warn("DRM with external licensing servers is NOT supported on version 2.3 or 2.4 of the Tizen platform due to errors with the encrypted media extensions interface!");
            return false;
        }
    }

    var streamFormatInfo = self.getStreamFormat(streamFormat);

    if(!CYIVideojsVideoPlayerStreamFormat.isValid(streamFormatInfo)) {
        return false;
    }

    if(CYIUtilities.isNonEmptyString(drmType)) {
        return streamFormatInfo.hasDRMType(drmType);
    }

    return true;
};

CYIVideojsVideoPlayer.prototype.clearStreamFormats = function clearStreamFormats() {
    var self = this;

    self.streamFormats.length = 0;
};

CYIVideojsVideoPlayer.prototype.notifyLiveStatus = function notifyLiveStatus() {
    var self = this;

    self.checkInitialized();

    self.sendEvent("liveStatus", self.isLive());
};

CYIVideojsVideoPlayer.prototype.notifyBitrateChanged = function notifyBitrateChanged() {
    var self = this;

    self.checkInitialized();

    var bitrateData = { };

    if(CYIUtilities.isValidNumber(self.initialAudioBitrateKbps) || CYIUtilities.isValidNumber(self.currentAudioBitrateKbps)) {
        bitrateData.initialAudioBitrateKbps = Math.floor(self.initialAudioBitrateKbps);
        bitrateData.currentAudioBitrateKbps = Math.floor(self.currentAudioBitrateKbps);
    }

    if(CYIUtilities.isValidNumber(self.initialVideoBitrateKbps) || CYIUtilities.isValidNumber(self.currentVideoBitrateKbps)) {
        bitrateData.initialVideoBitrateKbps = Math.floor(self.initialVideoBitrateKbps);
        bitrateData.currentVideoBitrateKbps = Math.floor(self.currentVideoBitrateKbps);
    }

    if(CYIUtilities.isValidNumber(self.initialTotalBitrateKbps) || CYIUtilities.isValidNumber(self.currentTotalBitrateKbps)) {
        bitrateData.initialTotalBitrateKbps = Math.floor(self.initialTotalBitrateKbps);
        bitrateData.currentTotalBitrateKbps = Math.floor(self.currentTotalBitrateKbps);
    }

    self.sendEvent("bitrateChanged", bitrateData);
};

CYIVideojsVideoPlayer.prototype.notifyBufferingStateChanged = function notifyBufferingStateChanged(buffering) {
    var self = this;

    self.checkInitialized();

    buffering = CYIUtilities.parseBoolean(buffering);

    if(CYIUtilities.isInvalid(buffering)) {
        return console.error(self.getDisplayName() + " tried to send an invalid buffering state value, expected a valid boolean value.");
    }

    self.sendEvent("bufferingStateChanged", buffering);
};

CYIVideojsVideoPlayer.prototype.notifyVideoTimeChanged = function notifyVideoTimeChanged() {
    var self = this;

    self.checkInitialized();

    var bufferedTimeRanges = self.video.buffered;
    var bufferedTimeRange = null;

    for(var i = 0; i < bufferedTimeRanges.length; i++) {
        if(self.video.currentTime >= bufferedTimeRanges.start(i) && self.video.currentTime <= bufferedTimeRanges.end(i)) {
            bufferedTimeRange = {
                start: bufferedTimeRanges.start(i),
                end: bufferedTimeRanges.end(i)
            };

            break;
        }
    }

    var data = {
        currentTimeSeconds: self.getCurrentTime()
    };

    if(CYIUtilities.isValid(bufferedTimeRange)) {
        data.bufferStartMs = Math.floor(bufferedTimeRange.start * 1000);
        data.bufferEndMs = Math.floor(bufferedTimeRange.end * 1000);
        data.bufferLengthMs = Math.floor((bufferedTimeRange.end - self.video.currentTime) * 1000);
    }
    else {
        data.bufferStartMs = 0;
        data.bufferEndMs = 0;
        data.bufferLengthMs = 0;
    }

    self.sendEvent("videoTimeChanged", data);
};

CYIVideojsVideoPlayer.prototype.notifyVideoDurationChanged = function notifyVideoDurationChanged() {
    var self = this;

    self.checkInitialized();

    if(CYIUtilities.isInvalidNumber(self.getDuration()) || self.getDuration() < 0) {
        return;
    }

    self.sendEvent("videoDurationChanged", self.getDuration());
};

CYIVideojsVideoPlayer.prototype.notifyActiveAudioTrackChanged = function notifyActiveAudioTrackChanged() {
    var self = this;

    self.checkInitialized();

    self.sendEvent("activeAudioTrackChanged", self.getActiveAudioTrack());
};

CYIVideojsVideoPlayer.prototype.notifyAudioTracksChanged = function notifyAudioTracksChanged() {
    var self = this;

    self.checkInitialized();

    self.sendEvent("audioTracksChanged", self.getAudioTracks());
};

CYIVideojsVideoPlayer.prototype.notifyActiveTextTrackChanged = function notifyActiveTextTrackChanged() {
    var self = this;

    self.checkInitialized();

    self.sendEvent("activeTextTrackChanged", self.getActiveTextTrack());
};

CYIVideojsVideoPlayer.prototype.notifyTextTracksChanged = function notifyTextTracksChanged() {
    var self = this;

    self.checkInitialized();

    self.sendEvent("textTracksChanged", self.getTextTracks());
};

CYIVideojsVideoPlayer.prototype.notifyTextTrackStatusChanged = function notifyTextTrackStatusChanged() {
    var self = this;

    self.checkInitialized();

    self.sendEvent("textTrackStatusChanged", self.isTextTrackEnabled());
};

CYIVideojsVideoPlayer.prototype.notifyMetadataAvailable = function notifyMetadataAvailable(identifier, value, timestamp, durationMs) {
    var self = this;

    self.checkInitialized();

    var metadata = CYIUtilities.isObjectStrict(identifier) ? identifier : {
        identifier: identifier,
        value: value,
        timestamp: timestamp,
        durationMs: durationMs
    };

    metadata.identifier = CYIUtilities.trimString(metadata.identifier);
    metadata.value = CYIUtilities.toString(metadata.value);
    metadata.timestamp = CYIUtilities.parseDate(metadata.timestamp, new Date()).getTime();
    metadata.durationMs = CYIUtilities.parseInteger(metadata.durationMs, -1);

    if(CYIUtilities.isEmptyString(metadata.identifier)) {
        if(self.verbose) {
            console.warn("Failed to send metadata event with empty identifier.");
        }

        return false;
    }

    self.sendEvent("metadataAvailable", metadata);

    return true;
};

CYIVideojsVideoPlayer.formatError = function formatError(error) {
    if(!CYIUtilities.isObject(error)) {
        return CYIUtilities.createError("Unknown error.");
    }

    var newError = CYIUtilities.createError(CYIUtilities.isNonEmptyString(error.message) ? error.message : "Unknown error.");

    if(CYIUtilities.isValid(error.stack)) {
        newError.stack = error.stack;
    }

    return newError;
};

CYIVideojsVideoPlayer.prototype.sendEvent = function sendEvent(eventName, data) {
    return CYIMessaging.sendEvent({
        context: CYIVideojsVideoPlayer.name,
        name: eventName,
        data: data
    });
};

CYIVideojsVideoPlayer.prototype.sendErrorEvent = function sendErrorEvent(eventName, error) {
    return CYIMessaging.sendEvent({
        context: CYIVideojsVideoPlayer.name,
        name: eventName,
        error: error
    });
};

Object.defineProperty(CYIVideojsVideoPlayerVersion, "PlayerVersionRegex", {
    value: /((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*))/,
    enumerable: false
});

Object.defineProperty(CYIVideojsVideoPlayer, "StreamFormat", {
    value: CYIVideojsVideoPlayerStreamFormat,
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "BitrateKbpsScale", {
    value: 1000,
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "State", {
    enumerable: true,
    value: CYIVideojsVideoPlayerState
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Invalid", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(-1, "Invalid")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Uninitialized", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(0, "Uninitialized")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Initialized", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(1, "Initialized")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Loading", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(2, "Loading")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Loaded", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(3, "Loaded")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Paused", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(4, "Paused")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Playing", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(5, "Playing")
});

Object.defineProperty(CYIVideojsVideoPlayerState, "Complete", {
    enumerable: true,
    value: new CYIVideojsVideoPlayerState(6, "Complete")
});

CYIVideojsVideoPlayerState.Uninitialized.transitionStates = [
    CYIVideojsVideoPlayerState.Initialized
];

CYIVideojsVideoPlayerState.Initialized.transitionStates = [
    CYIVideojsVideoPlayerState.Loading
];

CYIVideojsVideoPlayerState.Loading.transitionStates = [
    CYIVideojsVideoPlayerState.Initialized,
    CYIVideojsVideoPlayerState.Loaded
];

CYIVideojsVideoPlayerState.Loaded.transitionStates = [
    CYIVideojsVideoPlayerState.Initialized,
    CYIVideojsVideoPlayerState.Paused,
    CYIVideojsVideoPlayerState.Playing
];

CYIVideojsVideoPlayerState.Paused.transitionStates = [
    CYIVideojsVideoPlayerState.Initialized,
    CYIVideojsVideoPlayerState.Playing,
    CYIVideojsVideoPlayerState.Complete
];

CYIVideojsVideoPlayerState.Playing.transitionStates = [
    CYIVideojsVideoPlayerState.Initialized,
    CYIVideojsVideoPlayerState.Paused,
    CYIVideojsVideoPlayerState.Complete
];

CYIVideojsVideoPlayerState.Complete.transitionStates = [
    CYIVideojsVideoPlayerState.Initialized
];

Object.defineProperty(CYIVideojsVideoPlayer, "States", {
    enumerable: true,
    value: [
        CYIVideojsVideoPlayerState.Uninitialized,
        CYIVideojsVideoPlayerState.Initialized,
        CYIVideojsVideoPlayerState.Loading,
        CYIVideojsVideoPlayerState.Loaded,
        CYIVideojsVideoPlayerState.Paused,
        CYIVideojsVideoPlayerState.Playing,
        CYIVideojsVideoPlayerState.Complete
    ]
});

Object.defineProperty(CYIVideojsVideoPlayer, "properties", {
    value: new CYIVideojsVideoPlayerProperties(),
    enumerable: false
});

Object.defineProperty(CYIVideojsVideoPlayer, "ExternalTrackPrefix", {
    value: "external",
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "DRMKeys", {
    value: {
        playready: "com.microsoft.playready",
        widevine: "com.widevine.alpha"
    },
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "FormatMimeTypes", {
    value: {
        mp4: "video/mp4",
        dash: "application/dash+xml",
        hls: "application/x-mpegURL"
    },
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "TextTrackDisplayClassName", {
    value: "vjs-text-track-display",
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "DefaultVideoPlayerFileNames", {
    value: [
        "video.js",
        "videojs-contrib-eme.js"
    ],
    enumerable: true
});

Object.defineProperty(CYIVideojsVideoPlayer, "instance", {
    enumerable: true,
    get() {
        return CYIVideojsVideoPlayer.properties.instance;
    },
    set(value) {
        CYIVideojsVideoPlayer.properties.instance = value;
    }
});

Object.defineProperty(CYIVideojsVideoPlayer, "script", {
    enumerable: true,
    get() {
        return CYIVideojsVideoPlayer.properties.script;
    },
    set(value) {
        CYIVideojsVideoPlayer.properties.script = value;
    }
});

Object.defineProperty(CYIVideojsVideoPlayer, "playerVersion", {
    enumerable: true,
    get() {
        return CYIVideojsVideoPlayer.properties.playerVersion;
    },
    set(value) {
        CYIVideojsVideoPlayer.properties.playerVersion = value;
    }
});

CYIVideojsVideoPlayer.script = document.currentScript;
