// mixxx --controllerDebug

const Machine = {};

Machine.mode = 1;

Machine.utils = {
    getChanelGroup: function(number) {
        return '[Channel' + number + ']';
    },

    getMasterGroup: function() {
        return '[Master]';
    },

    getRackEffectUnit: function(unit, concat) {
        return '[EffectRack1_EffectUnit' + unit +  (concat ? '' : ']');
    },

    getRackEffectUnitEffect: function(unit, effectNumber) {
        return this.getRackEffectUnit(unit, true) + '_Effect' + effectNumber +']';
    },

};

Machine.channel = {
    channel_1: Machine.utils.getChanelGroup(1),
    channel_2: Machine.utils.getChanelGroup(2),
};

// Button
Machine.Button = function (options) {
    components.Button.call(this, options);
};

Machine.Button.prototype = new components.Button({

    standBy: function() {
        var flag = !!engine.getParameter(this.group, this.inKey)
        midi.sendShortMsg(this.midi[0], this.midi[1], flag ? 127: 3);
    },

    shut: function() {
        midi.sendShortMsg(this.midi[0], this.midi[1], 0);
    },

    ledOnOff: function(flag) {
        midi.sendShortMsg(this.midi[0], this.midi[1], flag ? 127: 3);
    },

    ledTurnOff: function() {
        this.ledOnOff(false);
    },

    ledTurnOn: function() {
        this.ledOnOff(true);
    },

    input: function() {
        components.Button.prototype.input.apply(this, arguments);
    }
});

// KNOB
Machine.Knob = function(options) {
    components.Pot.call(this, options);
};

Machine.Knob.prototype = new components.Pot({
    input: function () {
        components.Pot.prototype.input.apply(this, arguments);
    },
});

// POT
Machine.Pot = function(options) {
    components.Pot.call(this, options);
};

// PITCH --- PROTO
Machine.Pot.prototype = new components.Pot({
    input: function () {
        components.Pot.prototype.input.apply(this, arguments)
    },
});

// Master
Machine.Master = function() {

    const MasterGroup = Machine.utils.getMasterGroup();

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[Master]-headGain
    this.headphonesGain = new Machine.Knob({
        midi: [0xBE, 0x2F], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: MasterGroup,
        inKey: 'headGain',
    });

    this.headphonesMix = new Machine.Knob({
        // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[Master]-headMix
        midi: [0xBE, 0x27], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: MasterGroup,
        inKey: 'headMix',
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[Master]-crossfader
    this.crossfader = new Machine.Knob({
        midi: [0xBF, 0x08], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: MasterGroup,
        inKey: 'crossfader',
    });
};

Machine.Master.prototype = new components.ComponentContainer();

// Effect
Machine.Effect = function() {

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-meta
    this.meta = new Machine.Knob({
        midi: [0xB9, 0x04], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(1,1),
        inKey: 'meta',
        inSetParameter: function(value) {
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(1,1), this.inKey, value);
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(1,2), this.inKey, value);
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(1,3), this.inKey, value);

            engine.setParameter(Machine.utils.getRackEffectUnitEffect(2,1), this.inKey, value);
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(2,2), this.inKey, value);
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(2,3), this.inKey, value);
        }
    });

    https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-enabled
    this.effect1Enabled = new Machine.Button({
        type: components.Button.prototype.types.powerWindow,
        midi: [0x98, 0x00, 0x88, 0x00], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(1,1),
        inKey: 'enabled',

        input: function() {
            components.Button.prototype.input.apply(this, arguments);
            this.ledOnOff(!!engine.getParameter(this.group, this.inKey));
        },
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-enabled
    this.effect2Enabled = new Machine.Button({
        type: components.Button.prototype.types.powerWindow,
        midi: [0x98, 0x01, 0x88, 0x01], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(1,2),
        inKey: 'enabled',

        input: function() {
            components.Button.prototype.input.apply(this, arguments);
            this.ledOnOff(!!engine.getParameter(this.group, this.inKey));
        },
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-enabled
    this.effect3Enabled = new Machine.Button({
        type: components.Button.prototype.types.powerWindow,
        midi: [0x98, 0x02, 0x88, 0x02], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(1,3),
        inKey: 'enabled',

        input: function() {
            components.Button.prototype.input.apply(this, arguments);
            this.ledOnOff(!!engine.getParameter(this.group, this.inKey));
        },
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-enabled
    this.effect4Enabled = new Machine.Button({
        type: components.Button.prototype.types.powerWindow,
        midi: [0x99, 0x03, 0x89, 0x03], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(2,1),
        inKey: 'enabled',

        input: function() {
            components.Button.prototype.input.apply(this, arguments);
            this.ledOnOff(!!engine.getParameter(this.group, this.inKey));
        },
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-enabled
    this.effect5Enabled = new Machine.Button({
        type: components.Button.prototype.types.powerWindow,
        midi: [0x99, 0x04, 0x89, 0x04], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(2,2),
        inKey: 'enabled',

        input: function() {
            components.Button.prototype.input.apply(this, arguments);
            this.ledOnOff(!!engine.getParameter(this.group, this.inKey));
        },
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-enabled
    this.effect6Enabled = new Machine.Button({
        type: components.Button.prototype.types.powerWindow,
        midi: [0x99, 0x05, 0x89, 0x05], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: Machine.utils.getRackEffectUnitEffect(2,3),
        inKey: 'enabled',

        input: function() {
            components.Button.prototype.input.apply(this, arguments);
            this.ledOnOff(!!engine.getParameter(this.group, this.inKey));
        },
    });

    // // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN]-group_[ChannelI]_enable
    this.effectRack1 = new Machine.Button({
        type: components.Button.prototype.types.toggle,
        midi: [0xB8, 0x03],
        group: Machine.utils.getRackEffectUnit(1),
        inKey: 'group_[Channel1]_enable',
        link_inverse: 1,
        input: function(channel, control, value, status, group) {
            engine.setParameter(Machine.utils.getRackEffectUnit(1), 'group_[Channel1]_enable', value);
            engine.setParameter(Machine.utils.getRackEffectUnit(2), 'group_[Channel1]_enable', value)
        },
    });

    // // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN]-group_[ChannelI]_enable
    this.effectRack2 = new Machine.Button({
        type: components.Button.prototype.types.toggle,
        midi: [0xB9, 0x03],
        group: Machine.utils.getRackEffectUnit(1),
        inKey: 'group_[Channel2]_enable',
        link_inverse: 1,
        input: function(channel, control, value, status, group) {
            engine.setParameter(Machine.utils.getRackEffectUnit(1), 'group_[Channel2]_enable', value);
            engine.setParameter(Machine.utils.getRackEffectUnit(2), 'group_[Channel2]_enable', value)
        },
    });

    // // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[EffectRack1_EffectUnitN_EffectM]-parameterK
    this.effectBeat = new Machine.Knob({
        midi: [0xB9, 0x05],
        group: Machine.utils.getRackEffectUnitEffect(1,1),
        inKeyUnshifted: 'parameter1',
        input: function(channel, control, value, status, group) {
            // Flanger 
            var currentValueEffect3 = engine.getParameter(Machine.utils.getRackEffectUnitEffect(1,3), 'parameter1' );
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(1,3), 'parameter1', value > 10 ? currentValueEffect3 - 0.05 : currentValueEffect3 + 0.05 );

            // Echo
            var currentValueEffect4 = engine.getParameter(Machine.utils.getRackEffectUnitEffect(2,1), 'parameter1' );
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(2,1), 'parameter1', value > 10 ? currentValueEffect4 - 0.05 : currentValueEffect4 + 0.05 );

            // Phaser
            var currentValueEffect6 = engine.getParameter(Machine.utils.getRackEffectUnitEffect(2,3), 'parameter1' );
            engine.setParameter(Machine.utils.getRackEffectUnitEffect(2,3), 'parameter1', value > 10 ? currentValueEffect6 - 0.05 : currentValueEffect6 + 0.05 );
        }
    });
};

Machine.Effect.prototype = new components.ComponentContainer();

// Deck
Machine.Deck = function(deckNumbers) {
    var _this = this;
    var statusOffset = deckNumbers - 1;
    var group = Machine.utils.getChanelGroup(deckNumbers);

    components.Deck.call(this, deckNumbers);

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-play
    this.play = new Machine.Button({
        midi: [0x90 + statusOffset, 0x00], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: group,
        inKey: 'play',
        type: components.Button.prototype.types.toggle,

        ledControll: function() {
            var watch = engine.getParameter(this.group, this.inKey);
            this.ledOnOff(!!watch);
            _this.cue.ledControll();
        }
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-cue_cdj
    this.cue = new Machine.Button({
        midi: [0x90 + statusOffset, 0x01],
        group: group,
        inKey: 'cue_cdj',
        type: components.Button.prototype.types.toggle,

        ledControll: function() {
            if (!engine.getParameter(this.group, 'play_indicator')) {
                this.ledTurnOn();
            } else {
                this.ledTurnOff();
            }
        },

        input: function() {
            if (engine.getParameter(this.group, 'track_loaded')) {
                engine.setParameter(this.group, 'cue_cdj', 1);
            }
        },

        output: function() {
            engine.setParameter(this.group, 'cue_cdj', 0);

            if (!engine.getParameter(this.group, 'track_loaded')) {
                return;
            }
        }
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-cue_clear
    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-cue_point
    this.cueClear = new Machine.Button({
        midi: [0x90 + statusOffset, 0x05], // [midi_status_down, midi_number, midi_status_up, midi_number]
        group: group,
        inKey: 'cue_clear',
        type: components.Button.prototype.types.toggle,

        inSetValue: function(value) {

            print("cue_clear")
            engine.setParameter(this.group, this.inKey, 1);
            engine.setParameter(this.group, "cue_point", -1);
        }
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-beatsync
    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-beatsync_phase
    this.synch = new Machine.Button({
        midi: [0x90 + statusOffset, 0x02],
        group: group,
        inKey: 'beatsync',
        inSetValue: function() {
            components.Button.prototype.inSetValue.apply(this, arguments);
            engine.setValue(this.group, 'beatsync_phase', 1);
        }
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-rate
    this.pitch = new Machine.Pot({
        midi: [0xB0 + statusOffset, 0x09],
        group: group,
        inKey: 'rate',
        invert: true
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-beatloop_activate
    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-beatlooproll_activate
    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-beatloop_size
    this.loop = new Machine.Button({
        midi: [0x94 + statusOffset, 0x40],
        group: group,
        type: components.Button.prototype.types.press,
        inKey: 'beatloop_activate',


        inSetValue: function (value) {
            if (engine.getParameter(this.group, 'beatloop_activate')) {
                engine.setParameter(this.group, 'beatloop_activate', 0);
                engine.setParameter(this.group, 'beatlooproll_activate', 1);
            } else {
                engine.setParameter(this.group, 'beatloop_activate', 1);
            }
        }
    });

    this.loopDouble = new Machine.Button({
        midi: [0x94 + statusOffset, 0x35],
        group: group,
        inKey: 'loop_double',

        standBy: function() {
            if (engine.getParameter(group, 'beatloop_activate')) {
                this.ledControll();
            } else {
                this.ledOnOff(false);
            }
        },

        ledControll: function(flag) {
            var watch = engine.getParameter(this.group, 'beatloop_size');

            flag = typeof flag !== undefined ? flag : true;

            if (flag) {
                if (watch === 64) {
                    this.ledOnOff(false);
                } else {
                    this.ledOnOff(true);
                }
    
                if (watch > 0.03125) {
                    _this.loopDoubleLess.ledOnOff(true);
                }
            } else {
                this.ledOnOff(true);
            }

        },
        
        input: function (channel, control, value, status, group) {            
            var watch = engine.getParameter(this.group, 'beatloop_size');
            var newValue = watch;
            
            if (watch < 64) {
                newValue = watch * 2;
                engine.setParameter(this.group, 'beatloop_size', newValue);
            }
        },
    });

    this.loopDoubleLess = new Machine.Button({
        midi: [0x94 + statusOffset, 0x34],
        group: group,
        inKey: 'beatloop_size',

        standBy: function() {
            if (engine.getParameter(group, 'beatloop_activate')) {
                this.ledControll();
            } else {
                this.ledOnOff(false);
            }
        },

        ledControll: function() {
            var watch = engine.getParameter(this.group, this.inKey);
            if (watch === 0.03125) {
                this.ledOnOff(false);
            } else {
                this.ledOnOff(true);
            }

            if (watch < 64) {
                _this.loopDouble.ledOnOff(true);
            }
        },

        input: function (channel, control, value, status, group) {
            var watch = engine.getParameter(this.group, this.inKey);
            if (watch > 0.03125) {
                engine.setParameter(this.group, this.inKey, watch / 2);
            }
        },
    });

    // https://manual.mixxx.org/2.3/en/chapters/appendix/mixxx_controls.html#control-[ChannelN]-jog
    this.wheel = function (channel, control, value, status, group) {
        var forward = value < 64 ? 1 : -1;
        
        if (forward < 0) {
            engine.setValue(group, 'jog',  -1 * (128 - value) * 0.05);
        } else {
            engine.setValue(group, 'jog', value * 0.05);
        }
    }

    this.forward = new Machine.Button({
        midi: [0x94 + statusOffset, 0x1B],
        group: group,
        inKey: 'rateSearch',
        type: components.Button.prototype.types.toggle,

        standBy: function() {
            this.ledOnOff(false);
        },

        inSetValue: function() {
            engine.setValue(this.group, this.inKey, 5);
            this.ledOnOff(true);
        },
        output: function() {
            engine.setValue(this.group, this.inKey, 0);
            this.ledOnOff(false);
        }
    });

    this.backward = new Machine.Button({
        midi: [0x94 + statusOffset, 0x1A],
        group: group,
        inKey: 'rateSearch',
        type: components.Button.prototype.types.toggle,

        standBy: function() {
            this.ledOnOff(false);
        },

        inSetValue: function() {
            engine.setValue(this.group, this.inKey, -5);
            this.ledOnOff(true);
        },
        output: function() {
            engine.setValue(this.group, this.inKey, 0);
            this.ledOnOff(false);
        }
    });

    this.start = new Machine.Button({
        midi: [0x94 + statusOffset, 0x19],
        group: group,
        inKey: 'start',
        type: components.Button.prototype.types.press,

        standBy: function() {
            this.ledOnOff(false);
        },

        inSetValue: function(value) {
            engine.setValue(this.group, this.inKey, value);
            this.ledOnOff(true);
        },

        output: function() {
            this.ledOnOff(false);
        }
    });

    this.gridAdjust = new Machine.Button({
        midi: [0x90 + statusOffset, 0x03],
        group: group,
        inKey: 'beats_translate_curpos',
        type: components.Button.prototype.types.press,
    });

    this.jumpHalfForward = new Machine.Button({
        midi: [0x94 + statusOffset, 0x37],
        group: group,
        inKey: 'beatjump_1_forward',
        type: components.Button.prototype.types.press,
    });

    this.jumpHalfBackword = new Machine.Button({
        midi: [0x94 + statusOffset, 0x36],
        group: group,
        inKey: 'beatjump_1_backward',
        type: components.Button.prototype.types.press,
    });
}

Machine.Deck.prototype = new components.ComponentContainer();

// Mixer
Machine.Mixer = function(deckNumbers, instance) {
    var _this = this;
    var statusOffset = deckNumbers - 1;
    var group = Machine.utils.getChanelGroup(deckNumbers);

    this.treble = new Machine.Knob({
        midi: [0xB0 + statusOffset, 0x17],
        group: '[EqualizerRack1_' + group + '_Effect1]',
        inKey: 'parameter3',
        inSetParameter: function (value) {
            engine.setParameter(this.group, this.inKey, -0.2 + 1.4 * value);
        },
    });
    this.mid = new Machine.Knob({
        midi: [0xB0 + statusOffset, 0x18],
        group: '[EqualizerRack1_' + group + '_Effect1]',
        inKey: 'parameter2',
        inSetParameter: function (value) {
            engine.setParameter(this.group, this.inKey, -0.2 + 1.4 * value);
        },
    });
    this.bass = new Machine.Knob({
        midi: [0xB0 + statusOffset, 0x19],
        group: '[EqualizerRack1_' + group + '_Effect1]',
        inKey: 'parameter1',
        inSetParameter: function (value) {
            engine.setParameter(this.group, this.inKey, -0.2 + 1.4 * value);

            if (Machine.mode === 1) {
                engine.setParameter(this.group, 'parameter2', 1 - value);
            }

        },
    });
    this.filter = new Machine.Knob({
        midi: [0xB0 + statusOffset, 0x1A],
        group: '[QuickEffectRack1_' + group +']',
        inKey: 'super1',
        inSetParameter: function (value) {
            engine.setParameter(this.group, this.inKey, 0.3 + 0.40 * value);
        },
    });
    this.volume = new Machine.Knob({
        midi: [0xB0 + statusOffset, 0x1C],
        group: group,
        inKey: 'volume',
    });
    this.gain = new Machine.Knob({
        midi: [0xB0 + statusOffset, 0x16],
        group: group,
        inKey: 'pregain',
    });
    this.load = new Machine.Button({
        midi: [0x9F, 0x02 + statusOffset],
        group: group,
        inKey: 'LoadSelectedTrack',
        input: function() {
            components.Button.prototype.input.apply(this, arguments)
        }
    });
    this.headphonesCue = new Machine.Button({
        midi: [0x90 + statusOffset, 0x1B],
        type: components.Button.prototype.types.toggle,
        group: group,
        inKey: 'pfl',

        input: function () {
            components.Button.prototype.input.apply(this, arguments);
        },
    });
};

Machine.Mixer.prototype = new components.ComponentContainer();


Machine.Browse = function() {
    this.knob = new components.Encoder({
        group: '[Library]',
        inKey: 'Move',
        input: function (channel, control, value, status, group) {
            if (value === 1) {
                engine.setParameter(this.group, this.inKey + 'Down', 1);
            } else if (value === 127) {
                engine.setParameter(this.group, this.inKey + 'Up', 1);
            }
        }
	});

    this.knob2 = new components.Encoder({
        group: '[Library]',
        inKey: 'MoveFocus',
        input: function (channel, control, value, status, group) {
            if (value === 1) {
                engine.setParameter(this.group, this.inKey, 1);
            } else if (value === 127) {
                engine.setParameter(this.group, this.inKey, -1);
            }
        }
	});

    this.button = new components.Button({
        group: '[Library]',
        inKey: 'GoToItem',
        unshift: function() {
            this.inKey = 'GoToItem';
        },
        shift: function() {
            this.inKey = 'MoveFocusForward';
        },
    });
};
Machine.Browse.prototype = new components.ComponentContainer();


// Numark Mixtrack Pro FX
const MixtrackProFX = {};


MixtrackProFX.initControllLight = function(machine) {
    var keys = Object.keys(machine);
    keys.forEach(function(key) {
        var controll = machine[key];
        if (typeof controll['standBy'] === 'function') {
            controll['standBy']();
        }
    });
}

MixtrackProFX.shutControllLight = function(machine) {
    var keys = Object.keys(machine);
    keys.forEach(function(key) {
        var controll = machine[key];
        if (typeof controll['shut'] === 'function') {
            controll['shut']();
        }
    });
}

MixtrackProFX.initAllLights = function(Machines) {
    Machines.forEach(function(machine) {
        var keys = Object.keys(machine);
        if (keys[0] == 1) {
            keys.forEach(function(k) {
                MixtrackProFX.initControllLight(machine[k]);
            });
        } else {
            MixtrackProFX.initControllLight(machine);
        }
    });
}

MixtrackProFX.shutAllLights = function(Machines) {
    Machines.forEach(function(machine) {
        var keys = Object.keys(machine);
        if (keys[0] == 1) {
            keys.forEach(function(k) {
                MixtrackProFX.shutControllLight(machine[k]);
            });
        } else {
            MixtrackProFX.shutControllLight(machine);
        }
    });
}

MixtrackProFX.stopDemoControllerLights = function() {
    const exitDemoSysex = [0xF0, 0x7E, 0x00, 0x06, 0x01, 0xF7];
    midi.sendSysexMsg(exitDemoSysex, exitDemoSysex.length);

    const statusSysex = [0xF0, 0x00, 0x20, 0x7F, 0x03, 0x01, 0xF7];
    midi.sendSysexMsg(statusSysex, statusSysex.length);
};

MixtrackProFX.initSideConnection = function(i) {
        
    var group = Machine.utils.getChanelGroup(i);

    engine.makeConnection(group, "play", function(value) {
        MixtrackProFX.Deck[i].play.ledOnOff(!!value);
        MixtrackProFX.Deck[i].cue.ledOnOff(!value);
    });

    engine.makeConnection(group, "track_loaded", function(value) {
        // Status
        this.status[group].track_loaded = !!value;

        // Cue
        MixtrackProFX.Deck[i].cue.ledOnOff(!!value);

        // Loop
        MixtrackProFX.Deck[i].loop.ledOnOff(false);
        engine.setParameter(group, 'beatloop_activate', 0);
    });

    engine.makeConnection(group, "eject", function(value) {
        // Status
        this.status[group].track_loaded = false;

        // Loop
        MixtrackProFX.Deck[i].loop.ledOnOff(false);

        // Synch
        MixtrackProFX.Deck[i].synch.ledOnOff(false)
    });
    
    engine.makeConnection(group, "cue_indicator", function(value) {
        MixtrackProFX.Deck[i].cue.ledOnOff(!!value);
    });

    engine.makeConnection(group, "beatloop_activate", function(value) {

        // Switch On/Off Loop Light
        MixtrackProFX.Deck[i].loop.ledOnOff(!!value && !!this.status[group].track_loaded);
        this.status[group].beatloop_activate = !!value;

        if (this.status[group].beatloop_activate) {
            // Switch On/Off Loop Double/Less Light
            MixtrackProFX.Deck[i].loopDouble.ledControll(this.status[group].beatloop_activate && !!this.status[group].track_loaded);
            MixtrackProFX.Deck[i].loopDoubleLess.ledControll(this.status[group].beatloop_activate && !!this.status[group].track_loaded);
        } else {
            MixtrackProFX.Deck[i].loopDouble.ledOnOff(false);
            MixtrackProFX.Deck[i].loopDoubleLess.ledOnOff(false);
        }
    });
    
    engine.makeConnection(group, "beatloop_size", function(value) {
        if (this.status[group].beatloop_activate) {
            // Switch On/Off Loop Double/Less Light
            MixtrackProFX.Deck[i].loopDouble.ledControll(this.status[group].beatloop_activate && !!this.status[group].track_loaded);
            MixtrackProFX.Deck[i].loopDoubleLess.ledControll(this.status[group].beatloop_activate && !!this.status[group].track_loaded);
        } else {
            MixtrackProFX.Deck[i].loopDouble.ledOnOff(false);
            MixtrackProFX.Deck[i].loopDoubleLess.ledOnOff(false);
        }
    });

    engine.makeConnection(group, "beat_active", function(value) {
        if (this.status[group].track_loaded) {
            MixtrackProFX.Deck[i].synch.ledOnOff(!!value)
        } else {
            MixtrackProFX.Deck[i].synch.ledOnOff(false)
        }
    });

    engine.makeConnection(group, "VuMeter", function(value) {
        var level = value * 90;
	
        if(engine.getValue('[Channel1]', 'pfl')
            || engine.getValue('[Channel2]', 'pfl'))
        {		
            if (group == '[Channel1]') {
                midi.sendShortMsg(0xB0, 0x1F, level);
            }
            else if (group == '[Channel2]') {
                midi.sendShortMsg(0xB1, 0x1F, level);
            }
        }
        else if (group == '[Channel1]') {
            midi.sendShortMsg(0xB0, 0x1F, level);
        }
        else if (group == '[Channel2]') {
            midi.sendShortMsg(0xB1, 0x1F, level);
        }
    });

    engine.makeConnection(group, "pfl", function(value) {
        MixtrackProFX.Mixer[i].headphonesCue.ledOnOff(!!value);
    });
}


MixtrackProFX.initConnection = function() {
    this.status = {}

    this.status[Machine.utils.getChanelGroup(1)] = {
        track_loaded: engine.getParameter(Machine.utils.getChanelGroup(1), 'track_loaded'),
        beatloop_activate: engine.getParameter(Machine.utils.getChanelGroup(1), 'beatloop_activate'),
    }

    this.status[Machine.utils.getChanelGroup(2)] = {
        track_loaded: engine.getParameter(Machine.utils.getChanelGroup(2), 'track_loaded'),
        beatloop_activate: engine.getParameter(Machine.utils.getChanelGroup(2), 'beatloop_activate'),
    }

    for (var i = 1; i < 3; i++) {
        this.initSideConnection(i)
    }

    // Single Connections
};

MixtrackProFX.init = function(id, debug) {
    // [Master]
    // 1. headphonesGain.input
    // 2. headphonesMix.input
    // 3. crossfader.input
    MixtrackProFX.Master = new Machine.Master();

    // [EffectRack1_EffectUnitN_EffectM]
    // 1. meta
    // 2. effect1Enabled
    // 3. effect2Enabled
    // 4. effect3Enabled
    // 5. effect4Enabled
    // 6. effect5Enabled
    // 7. effect6Enabled
    // 8. effectRack1
    // 9. effectRack2
    // 10. effectBeat
    MixtrackProFX.Effect = new Machine.Effect();

    // [Channel] Deck
    // 1.play
    // 2.cue_cdj
    //  2.1 cue_clear
    // 3.synch
    // 4.pitch
    // 5.loop
    // 6.loopDouble
    // 7.loopDoubleLess
    // 8.Wheel
    // 9.forward
    // 10. backward
    // 11. start
    MixtrackProFX.Deck = new components.ComponentContainer();
    MixtrackProFX.Deck[1] = new Machine.Deck(1);
    MixtrackProFX.Deck[2] = new Machine.Deck(2);

    // [Channel] Mixer
    // 1. treble
    // 2. mid
    // 3. bass
    // 4. filter
    // 5. volume
    // 6. gain
    // 7. load
    // 8. headphonesCue
    MixtrackProFX.Mixer = new components.ComponentContainer();
    MixtrackProFX.Mixer[1] = new Machine.Mixer(1, this);
    MixtrackProFX.Mixer[2] = new Machine.Mixer(2, this);

    MixtrackProFX.Browser = new Machine.Browse();

    // Stop Controller Demo
    MixtrackProFX.stopDemoControllerLights();

    // Init Lights
    MixtrackProFX.initAllLights(
    [
        MixtrackProFX.Mixer, 
        MixtrackProFX.Deck, 
        MixtrackProFX.Master,
        MixtrackProFX.Effect
    ]);
    MixtrackProFX.initConnection();
}

MixtrackProFX.shutdown = function() {
    MixtrackProFX.shutAllLights(
    [
        MixtrackProFX.Mixer, 
        MixtrackProFX.Deck, 
        MixtrackProFX.Master,
        MixtrackProFX.Effect
    ]);
}