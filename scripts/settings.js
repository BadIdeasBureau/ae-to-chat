Hooks.on("init", async ()=>{
    await game.settings.register('ae-to-chat', 'showDisable', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.ShowDisable"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.ShowDisable"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Boolean,       // Number, Boolean, String,  
        default: true
    });

    await game.settings.register('ae-to-chat', 'showShowInfo', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.ShowShowInfo"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.ShowShowInfo"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Boolean,       // Number, Boolean, String,  
        default: true
    });

    await game.settings.register('ae-to-chat', 'showDelete', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.ShowDelete"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.ShowDelete"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: Boolean,       // Number, Boolean, String,  
        default: true
    });

    
    await game.settings.register('ae-to-chat', 'effectMessageMode', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.EffectMessageMode"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.EffectMessageMode"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "public",
        choices: {
            "gmwhisper": game.i18n.localize("AE_TO_CHAT.Settings.MessageMode.Whisper"), //whisper to GMs, and to the user if they are not a GM
            "public": game.i18n.localize("AE_TO_CHAT.Settings.MessageMode.Public") //send to chat
        }
    });
    
    await game.settings.register('ae-to-chat', 'confirmationMode', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.ConfirmationMode"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.MessageMode"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "whisper",
        choices: {
            "whisper": game.i18n.localize("AE_TO_CHAT.Settings.MessageMode.Whisper"), //whisper to user
            "gmwhisper": game.i18n.localize("AE_TO_CHAT.Settings.MessageMode.GMWhisper"), //whisper to GMs, and to the user if they are not a GM
            "public": game.i18n.localize("AE_TO_CHAT.Settings.MessageMode.Public"), //send to chat
            "none": game.i18n.localize("AE_TO_CHAT.Settings.MessageMode.None") //nothing
        }
    });
    
    await game.settings.register('ae-to-chat', 'startTurn', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.StartTurn"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.StartTurn"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "all",
        choices:{
            "none": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.None"),
            "all": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.AllTokens"),
            "linked": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.LinkedOnly"),
            "player": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.PlayerOnly")
        }
    });

    await game.settings.register('ae-to-chat', 'onApply', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.OnApply"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.OnApply"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "none",
        choices:{
            "none": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.None"),
            "linked": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.LinkedOnly"),
            "player": game.i18n.localize("AE_TO_CHAT.Settings.TokenSet.PlayerOnly")
        }
    });

    await game.settings.register('ae-to-chat', 'timeout', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.Timeout"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.Timeout"),
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
})