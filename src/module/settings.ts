import { debug, log, setDebugLevel, warn, i18n } from '../ae-to-chat';

export const MODULE_NAME = 'ae-to-chat';

export const registerSettings = function () {

    game.settings.register(MODULE_NAME, 'showDisable', {
        name: i18n(MODULE_NAME+".Settings.ShowDisable"),
        hint: i18n(MODULE_NAME+".Settings.Hints.ShowDisable"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Boolean,       // Number, Boolean, String,  
        default: true
    });

    game.settings.register(MODULE_NAME, 'showShowInfo', {
        name: i18n(MODULE_NAME+".Settings.ShowShowInfo"),
        hint: i18n(MODULE_NAME+".Settings.Hints.ShowShowInfo"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Boolean,       // Number, Boolean, String,  
        default: true
    });

    game.settings.register(MODULE_NAME, 'showDelete', {
        name: i18n(MODULE_NAME+".Settings.ShowDelete"),
        hint: i18n(MODULE_NAME+".Settings.Hints.ShowDelete"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Boolean,       // Number, Boolean, String,  
        default: true
    });

    
    game.settings.register(MODULE_NAME, 'effectMessageMode', {
        name: i18n(MODULE_NAME+".Settings.EffectMessageMode"),
        hint: i18n(MODULE_NAME+".Settings.Hints.EffectMessageMode"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "public",
        choices: {
            "gmwhisper": i18n(MODULE_NAME+".Settings.MessageMode.Whisper"), //whisper to GMs, and to the user if they are not a GM
            "public": i18n(MODULE_NAME+".Settings.MessageMode.Public") //send to chat
        }
    });

    game.settings.register(MODULE_NAME, 'hiddenTokenOverride', {
        name: i18n(MODULE_NAME+".Settings.hiddenTokenOverride"),
        hint: i18n(MODULE_NAME+".Settings.Hints.hiddenTokenOverride"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "public",
        choices: {
            "none": i18n(MODULE_NAME+".Settings.MessageMode.None"),
            "gmwhisper": i18n(MODULE_NAME+".Settings.MessageMode.Whisper"), //whisper to GMs, and to the user if they are not a GM
            "default": i18n(MODULE_NAME+".Settings.MessageMode.Default") //send to chat
        }
    });
    
    game.settings.register(MODULE_NAME, 'confirmationMode', {
        name: i18n(MODULE_NAME+".Settings.ConfirmationMode"),
        hint: i18n(MODULE_NAME+".Settings.Hints.MessageMode"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "whisper",
        choices: {
            "whisper": i18n(MODULE_NAME+".Settings.MessageMode.Whisper"), //whisper to user
            "gmwhisper": i18n(MODULE_NAME+".Settings.MessageMode.GMWhisper"), //whisper to GMs, and to the user if they are not a GM
            "public": i18n(MODULE_NAME+".Settings.MessageMode.Public"), //send to chat
            "none": i18n(MODULE_NAME+".Settings.MessageMode.None") //nothing
        }
    });
    
    game.settings.register(MODULE_NAME, 'startTurn', {
        name: i18n(MODULE_NAME+".Settings.StartTurn"),
        hint: i18n(MODULE_NAME+".Settings.Hints.StartTurn"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "all",
        choices:{
            "none": i18n(MODULE_NAME+".Settings.TokenSet.None"),
            "all": i18n(MODULE_NAME+".Settings.TokenSet.AllTokens"),
            "linked": i18n(MODULE_NAME+".Settings.TokenSet.LinkedOnly"),
            "player": i18n(MODULE_NAME+".Settings.TokenSet.PlayerOnly")
        }
    });

    game.settings.register(MODULE_NAME, 'onApply', {
        name: i18n(MODULE_NAME+".Settings.OnApply"),
        hint: i18n(MODULE_NAME+".Settings.Hints.OnApply"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "none",
        choices:{
            "none": i18n(MODULE_NAME+".Settings.TokenSet.None"),
            "linked": i18n(MODULE_NAME+".Settings.TokenSet.LinkedOnly"),
            "player": i18n(MODULE_NAME+".Settings.TokenSet.PlayerOnly")
        }
    });

    game.settings.register(MODULE_NAME, 'timeout', {
        name: i18n(MODULE_NAME+".Settings.Timeout"),
        hint: i18n(MODULE_NAME+".Settings.Hints.Timeout"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Number,       // Number, Boolean, String,  
        default: 300,
        range:{
            min: 0,
            max: 1000,
            step: 50
        }
    });

}

// function setup(templateSettings) {
// 	templateSettings.settings().forEach(setting => {
// 		let options = {
// 			name: i18n(templateSettings.name()+"."+setting.name+'.Name'),
// 			hint: i18n(`${templateSettings.name()}.${setting.name}.Hint`),
// 			scope: setting.scope,
// 			config: true,
// 			default: setting.default,
// 			type: setting.type,
// 			choices: {}
// 		};
// 		if (setting.choices) options.choices = setting.choices;
// 		game.settings.register(templateSettings.name(), setting.name, options);
// 	});
// }
