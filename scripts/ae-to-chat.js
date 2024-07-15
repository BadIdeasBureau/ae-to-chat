//output effects to chat at the start of a token's turn (with timeout to guard against hilarity when deleting a token)
//TODO: Add more logging.  Bug reporter integration.

//Dev mode integration
const MODULE_ID = "ae-to-chat";




function log(...args) {
    try {
        const isDebugging = game.settings.get(MODULE_ID, "debug");

        if (isDebugging) {
            console.log(MODULE_ID, '|', ...args);
        }
    } catch (e) {}
}

// ...


Hooks.on("ready", ()=> {
        if (game.user.isGM) {
			Hooks.on("combatTurnChange", (combat, prior, current) => {
				if(!(game.users.activeGM.isSelf)) return //only run for first active GM

				//start of turn messages
				const tokenStartingTurn = combat.combatants.get(current.combatantId).token
				if(
					(game.settings.get(MODULE_ID, "startTurn") === "linked" && tokenStartingTurn.isLinked) || //setting is set to linked only and actor linked
                    (game.settings.get(MODULE_ID, "startTurn") === "player" && tokenStartingTurn.actor.hasPlayerOwner) || //setting is set to players only and actor is owned by a player
					(game.settings.get(MODULE_ID, "startTurn") === "all") //setting is set to all tokens
				) {
					printActive({
						effects: tokenStartingTurn.actor.temporaryEffects,
						token: tokenStartingTurn,
						hookType: "startTurn"
					})
				}

				//end of turn messages
				const tokenEndingTurn = combat.combatants.get(current.combatantId).token
				if(
					(game.settings.get(MODULE_ID, "endTurn") === "linked" && tokenEndingTurn.isLinked) || //setting is set to linked only and actor linked
                    (game.settings.get(MODULE_ID, "endTurn") === "player" && tokenEndingTurn.actor.hasPlayerOwner) || //setting is set to players only and actor is owned by a player
					(game.settings.get(MODULE_ID, "endTurn") === "all") //setting is set to all tokens
				) {
					printActive({
						effects: tokenEnbingTurn.actor.temporaryEffects,
						token: tokenEndingTurn,
						hookType: "endTurn"
					})
				}

			})
		}
	})

//output new effects to chat  - REMOVED for v2.


Hooks.on("renderChatMessage",(app,html,data) => {
	_onRenderChatMessage(app,html,data);
});

//print active effects.  effects is an array [effectData,...], tokenData is tokenData, scene is a scene object
async function printActive({effects, token, hookType}) {
    log("Printing active effect with arguments", effects, token, hookType)
	let subtitle;
	switch (hookType){ //allows adding a subtitle depending on the hook used (set as a variable, not autodetected).  Current could be an if statement, but, yknow, progress and such
		case "startTurn": 
			subtitle = game.i18n.format("AE_TO_CHAT.ChatCard.startTurn", {tokenName: token.name})
			break;
		case "endTurn": 
			subtitle = game.i18n.format("AE_TO_CHAT.ChatCard.endTurn", {tokenName: token.name})
			break;
		default:
			break;
	}

    const speaker = {
	    token: token.id,
	    scene: token.parent?.id
    }
	//Assemble arguments in data for the template
	const templateData = {
        speaker,
		effects,
		settings: {
			disable: game.settings.get(MODULE_ID,"showDisable"),
			showinfo: game.settings.get(MODULE_ID,"showShowInfo"),
			delete: game.settings.get(MODULE_ID,"showDelete")
		},
		subtitle,
	}
	
	//Use the handlebars template to construct the chat message, and define the other things we need here
	const content = await renderTemplate("modules/ae-to-chat/templates/chatmessage.hbs",templateData);
	const user = game.userId;
	const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
	
	//make the chat message
	const gmUsers = game.users.filter(user => user.isGM);
	let whisper = [];
	
	switch(game.settings.get(MODULE_ID,"effectMessageMode")){
		case "gmwhisper":
			whisper.push(gmUsers);
			break;
		default: //if setting is the wrong value, fall back to public
		case "public":
			break; //leaving the array of whisper recipients blank keeps the message public
	}

	if (token.hidden){
		switch(game.settings.get(MODULE_ID,"hiddenTokenOverride")){
			case "gmwhisper":
				whisper = gmUsers; //set the array to only GM users
				break;
			case "none":
				return;
			default: //if setting is the wrong value, fall back to default
			case "default":
				break; //leave the array as was previously generated
		}
	}

	return await ChatMessage.create({
		speaker,
		content,
		type,
		user,
		whisper
	});
}

async function _onRenderChatMessage(app, html, data) {
	if (data.message.content && !data.message.content.match(MODULE_ID)) {
		return;
	}

	const speaker = data.message.speaker;

	if (!speaker) return;
	const sceneId = /*speaker.scene ??*/ html.find("div[class='ae-to-chat header']")[0]?.dataset?.sceneId; //commented out section is old behaviour using speaker to pass data.  Was incompatible with 
	const tokenId = /*speaker.token ??*/ html.find("div[class='ae-to-chat header']")[0]?.dataset?.tokenId;
	const scene = game.scenes.get(sceneId) ?? null;
	const token = (canvas?.tokens?.get(tokenId)) ?? (scene?.tokens.find(t => t.id === tokenId));
	log("onRenderChatMessage token/scene", token, scene)
	const deleteEffectAnchor = html.find("a[name='delete-row']");
	const disableEffectAnchor = html.find("a[name='disable-row']");
	const showInfoEffectAnchor = html.find("a[name='showinfo-row']");

	if (!token || (token && !game.user.isGM && !token.actor.owner)) {
		deleteEffectAnchor?.parent().hide();
		disableEffectAnchor?.parent().hide();
		showInfoEffectAnchor?.parent().hide();
	}

	deleteEffectAnchor?.on("click", event => {
		async function anchorDelete(effect){
			await effect.delete()
            return game.i18n.format("AE_TO_CHAT.ChatCard.EffectDeleted", {name: effect.name})
		}
		_anchorHandler(event, anchorDelete);
	});

	disableEffectAnchor?.on("click", event => {
		async function anchorDisable(effect) {
			await effect.update({disabled: true})
            return game.i18n.format("AE_TO_CHAT.ChatCard.EffectDisabled", {name: effect.name})
		}
		_anchorHandler(event, anchorDisable);
	});
	
	showInfoEffectAnchor?.on("click", event => {
		async function anchorShowInfo(effect) {
			effect.sheet.render(true)
		}
		_anchorHandler(event, anchorShowInfo);
	});
}

async function _anchorHandler(event, anchorAction){
	//takes an event, returns null if either message, speaker, or token are missing, and returns {speaker, tokenData, effectId} otherwise
	//Speaker may not be needed in there, but it's a handy thing that contains a ton of other data, so... might as well
	//Grab all the relevant data from the message
	const effectListItem = event.target.closest("li");
	log("effectListItem", effectListItem, event)
	const effectUUID = effectListItem.dataset.effectUuid;
	log("effectUUID", effectUUID)
	const messageListItem = effectListItem?.parentElement?.closest("li");
	const messageId = messageListItem?.dataset?.messageId;
	const message = messageId ? game.messages.get(messageId) : null;
	//Check the message still exists (and wonder how they managed to click the button if it didn't)
	if (!message) return;

	const effect = await fromUuid(effectUUID)

    let content;
	if(!effect) {
        content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
    } else {
        content = await anchorAction(effect);
    }

	//Confirm in chat
	if (game.settings.get(MODULE_ID,"confirmationMode") === "none") return; //if selected, prevent chat confirmation

	const user = game.userId;
	const gmUsers = game.users.filter(user => user.isGM && user.active);
	let whisper = [];

	switch(game.settings.get(MODULE_ID,"confirmationMode")){
		case "gmwhisper":
			whisper.push(gmUsers);
			if (gmUsers.includes(user)) break; //don't add the current user to the array if they're already a GM, otherwise go to next step to add them
		default: //if setting is the wrong value, fall back to whisper user only
		case "whisper":
			whisper.push(user);
			break;
		case "public":
			break;
	}
    const type = CONST.CHAT_MESSAGE_TYPES.OTHER;

			
	//make the chat message

    return ChatMessage.create({
        content,
        type,
        user,
        whisper
    });
}