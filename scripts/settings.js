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
    
    //not yet implemented - will be way easier to do after refactoring the handlers
    /*
    await game.settings.register('ae-to-chat', 'confirmationMode', {
        name: game.i18n.localize("AE_TO_CHAT.Settings.ConfirmationMode"),
        hint: game.i18n.localize("AE_TO_CHAT.Settings.Hints.ConfirmationMode"),
        scope: 'world',     // "world" = sync to db, "client" = local storage 
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,  
        default: "whisper",
        choices: {
            "whisper": game.i18n.localize("AE_TO_CHAT.Settings.ConfirmationMode.Whisper"), //whisper to user
            "gmwhisper": game.i18n.localize("AE_TO_CHAT.Settings.ConfirmationMode.GMWhisper"), //whisper to GMs, and to the user if they are not a GM
            "public": game.i18n.localize("AE_TO_CHAT.Settings.ConfirmationMode.Public"), //send to chat
            "none": game.i18n.localize("AE_TO_CHAT.Settings.ConfirmationMode.None") //nothing
        }
    })
    */
})