//output effects to chat at the start of a token's turn (with timeout to guard against hilarity when deleting a token)
//TODO: Add more logging.  Bug reporter integration.

//Dev mode integration
const MODULE_ID = "ae-to-chat";

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(MODULE_ID);
});



function log(...args) {
    try {
        const isDebugging = window.DEV?.getPackageDebugValue(MODULE_ID);

        if (isDebugging) {
            console.log(MODULE_ID, '|', ...args);
        }
    } catch (e) {}
}

// ...


Hooks.on("ready", ()=> {
        if (game.user.isGM) {
            Hooks.on("updateCombat", (combat, changes, options) => {
                    if (!options.diff) return; //options.diff is true for all the situations we care about.
                    if ((game.settings.get(MODULE_ID, "startTurn") === "none") || !(game.user === game.users.find((u) => u.isGM && u.active))) return;
                    log("updateCombat Hook fired and initial gates passed")
                    const hookType = "updateCombat"
                    const combatant = combat.combatant;
                    const tokenDocument = combatant.token;
                    if (
                        !tokenDocument || //combatant isn't a token
                        (game.settings.get(MODULE_ID, "startTurn") === "linked" && !tokenDocument.isLinked) || //setting is set to linked only and actor is not linked
                        (game.settings.get(MODULE_ID, "startTurn") === "player" && !tokenDocument.actor.hasPlayerOwner) //setting is set to players only and actor is not owned by a player
                    ) {
                        return;
                    }
                    const effects = combatant.actor.temporaryEffects;
                    if (effects.length === 0) {
                        return; //no chat message if no effects are present
                    }
                    printActive({
                        effects,
                        token: tokenDocument,
                        hookType
                    });
                }
            );


//output new effects to chat.
// the timer nonsense here is because e.g. for an AoE using Midi and DAE, we could have any number of different effects applying at once to any number of tokens - so we consolidate them into an array, and then process that to generate only one message per target

//set up a hook to start a timer when an effect is added
            setHookOnce();

//set up a hook to add things to the array during the timer
            Hooks.on("createActiveEffect", (effectDocument) => {
                log("effect creation detected with document", effectDocument)
                if (
                    (game.settings.get(MODULE_ID, "onApply") === "none") ||
                    (game.settings.get(MODULE_ID, "onApply") === "player" && !actor.hasPlayerOwner) ||
                    !(game.user === game.users.find((u) => u.isGM && u.active))
                ) return;
                if (effectDocument.isTemporary) { //temporary effects only.  TODO add support for other effects.
                    effectArray.push(effectDocument)
                }
            });
        }
    }
)

//define an empty array on startup
var effectArray = [];  // Expected array structure: [{actor, token, effect: effectData}], with EITHER actor OR token, which will be reduced later

//function to set up the timer hook.
function setHookOnce() {
    log("HookOnce set")
    Hooks.once("createActiveEffect", (effect) => {
        let actor = effect.parent;
        if (
            (game.settings.get(MODULE_ID, "onApply") === "none") ||
            (game.settings.get(MODULE_ID, "onApply") === "player" && !actor.hasPlayerOwner) ||
            !(game.user === game.users.find((u) => u.isGM && u.active))
        ) return;
        setTimeout(processEffectArray, game.settings.get(MODULE_ID, "timeout"))
    })
}

//take the resulting array and render the chat messages
function processEffectArray(){
	let hookType="createActiveEffect";
	let effectArrayCopy = Array.from(effectArray); //might be able to naively assign here, but probably worth making a new object explicitly just to be sure.
	effectArray = []; //clear out the effectArray, so that it's available as soon as possible for
	setHookOnce();

	let reducedEffectArray = effectArrayCopy.reduce(reducer, []) //take the array of effects and reduce it to an array of {actor or token, [effects]}, with one object for each linked actor and each unlinked token

    function reducer(accumilator, effect){
        let actor = effect.parent;
        if (game.settings.get(MODULE_ID, "onApply")==="player" && actor.hasPlayerOwner) return accumilator; //ignore non-PC actors if that setting is set
	    let token = actor.parent; //only exists for an unlinked token

	    if(token  && !(game.settings.get(MODULE_ID, "onApply")==="linked") ){ //unlinked actors get stored as tokens, ignore if setting is set like that
	        let tokenObject = accumilator.find(o => o.token?.id === token.id)
            if (tokenObject) {
                tokenObject.effects.push(effect)
            } else {
                accumilator.push({token, effects: [effect]})
            }
        } else {
            let actorObject = accumilator.find(o => o.actor?.id === actor?.id)
            if (actorObject) {
                actorObject.effects.push(effect)
            } else {
                accumilator.push({actor, effects: [effect]})
            }
        }
	    return accumilator;
    }

	reducedEffectArray.forEach(o => {
	    let token = o.token ?? o.actor?.getActiveTokens().filter(t => t.document.data.actorLink)[0].document //grab the token from the object, or any linked token from the actor if there isn't one
        if(!token) return; //if this happens, something has gone weird.
		let effects = o.effects.filter(e => e.isTemporary); //filter the array down to only temporary effects
		if (effects.length === 0) return; //if there are no effects to print, don't print them
		printActive({effects, token, hookType})
	})
}


Hooks.on("renderChatMessage",(app,html,data) => {
	_onRenderChatMessage(app,html,data);
});

//print active effects.  effects is an array [effectData,...], tokenData is tokenData, scene is a scene object
async function printActive({effects, token, hookType}) {
    log("Printing active effect with arguments", effects, token, hookType)
	let subtitle;
	switch (hookType){ //allows adding a subtitle depending on the hook used (set as a variable, not autodetected).  Current could be an if statement, but, yknow, progress and such
        case "createActiveEffect":
			subtitle = game.i18n.format("AE_TO_CHAT.ChatCard.AddEffect", {tokenName: token.name})
			break;
		default:
			break;
	}
	if(effects[0].data) effects = effects.map(e=>e.data ?? e) //if we have the whole effect rather than the data object, chunk down to the data object

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
	const gmUsers = game.users.filter(user => user.isGM && user.active);
	let whisper = [];
	
	switch(game.settings.get(MODULE_ID,"effectMessageMode")){
		case "gmwhisper":
			whisper.push(gmUsers);
			break;
		default: //if setting is the wrong value, fall back to public
		case "public":
			break; //leaving the array of whisper recipients blank keeps the message public
	}

	if (token.data.hidden){
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
	const token = (canvas?.tokens?.get(sceneId)) ?? (scene?.data.tokens.find(t => t.id === tokenId));
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
            return game.i18n.format("AE_TO_CHAT.ChatCard.EffectDeleted", {label: effect.data.label})
		}
		_anchorHandler(event, anchorDelete);
	});

	disableEffectAnchor?.on("click", event => {
		async function anchorDisable(effect) {
			await effect.update({disabled: true})
            return game.i18n.format("AE_TO_CHAT.ChatCard.EffectDisabled", {label: effect.data.label})
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