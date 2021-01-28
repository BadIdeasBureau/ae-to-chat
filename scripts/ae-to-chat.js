
Hooks.on("updateCombat", (tracker) =>{
	if(game.user === game.users.find((u) => u.isGM && u.active)){
		const combatant = tracker.combatant;
		const tokenData = combatant.token;
		const scene = tracker.scene;
		if (!tokenData){
			return;
		}
		const tempEffects = combatant.actor.temporaryEffects; 
		if (tempEffects.length === 0){
			return; //no chat message if no effects are present
		}
		const effects = tempEffects.map(e=>({icon: e.data.icon, name: e.data.label, id: e.data._id}));
		printActive(effects, tokenData, scene)
	}
}
);

Hooks.on("renderChatMessage",(app,html,data) => {
	_onRenderChatMessage(app,html,data);
});


async function printActive(effects, tokenData, scene) {
	//Assemble arguments in data for the template
	const templateData = {
		tokenId: tokenData.id,
		effects: effects,
		settings: {
			disable: game.settings.get("ae-to-chat","showDisable"),
			showinfo: game.settings.get("ae-to-chat","showShowInfo"),
			delete: game.settings.get("ae-to-chat","showDelete")
		}
	}
	
	//Use the handlebars template to construct the chat message, and define the other things we need here
	const content = await renderTemplate("modules/ae-to-chat/templates/chatmessage.hbs",templateData);
	const speaker = await ChatMessage.getSpeaker({token: new Token(tokenData, scene)});
	const chatUser = game.userId;
	const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;
	
	//make the chat message
	return await ChatMessage.create({
		speaker,
		content,
		type: chatType,
		user: chatUser
	});
}

async function _onRenderChatMessage(app, html, data) {
	if (data.message.content && !data.message.content.match("ae-to-chat")) {
		return;
	}

	const speaker = data.message.speaker;

	if (!speaker) return;

	const scene = game.scenes.get(speaker.scene) ?? null;
	const token = (canvas ? canvas?.tokens.get(speaker.token) : null) ?? (scene ? scene.data.tokens.find(t => t._id === speaker.token) : null);
	const deleteEffectAnchor = html.find("a[name='delete-row']");
	const disableEffectAnchor = html.find("a[name='disable-row']");
	const showInfoEffectAnchor = html.find("a[name='showinfo-row']");

	if (!token || (token && !game.user.isGM)) {
		deleteEffectAnchor?.parent().hide();
		disableEffectAnchor?.parent().hide();
		showInfoEffectAnchor?.parent().hide();
	}


	deleteEffectAnchor?.on("click", event => {
		async function anchorDelete(token, effectId, effectName){
			let content = ""                                    
			if(! await token.actor.effects.get(effectId)?.delete()){
				content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
			} else {content = `${game.i18n.localize("AE_TO_CHAT.ChatCard.EffectDeleted")} ${effectName}`};
			return content
		}

		_anchorHandler(event, anchorDelete);
	});

	disableEffectAnchor?.on("click", event => {
		async function anchorDisable(token, effectId, effectName) {
			let content;                                    
			if(! await token.actor.effects.get(effectId)?.update({disabled: true})){
				content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
			} else {content = `${game.i18n.localize("AE_TO_CHAT.ChatCard.EffectDisabled")} ${effectName}`};
			return content;
		}
		
		_anchorHandler(event, anchorDisable);
	});
	
	showInfoEffectAnchor?.on("click", event => {
		async function anchorShowInfo(token, effectId, effectName) {
			let content;                                    
			if(! await token.actor.effects.get(effectId)?.sheet.render(true)){
				content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
			}
			return content;
		}
		
		_anchorHandler(event, anchorShowInfo);
	});
}

async function _anchorHandler(event, anchorAction){
	//takes an event, returns null if either message, speaker, or token are missing, and returns {speaker, tokenData, effectId} otherwise
	//Speaker may not be needed in there, but it's a handy thing that contains a ton of other data, so... might as well
	//Grab all the relevant data from the message
	const effectListItem = event.target.closest("li");
	const effectId = effectListItem.dataset.effectId;
	const messageListItem = effectListItem?.parentElement?.closest("li");
	const messageId = messageListItem?.dataset?.messageId;
	const message = messageId ? game.messages.get(messageId) : null;
	//Check the message still exists (and wonder how they managed to click the button if it didn't)
	if (!message) return;
	const speaker = message?.data?.speaker;
	//Check the message has a speaker
	if (!speaker) return;
	const tokenData = game.scenes.get(speaker.scene).data.tokens.find(t => t._id===speaker.token);

	//Make sure the tokenData was fetched (i.e. the token exists)
	if (!tokenData) return;

	//Make a voodoo doll of the token from the incomplete token data
	const token = new Token(tokenData);
	const effectName = token.actor.effects.get(effectId)?.data.label;

	//pass the voodoo doll to the function that does the thing
	let content = await anchorAction(token, effectId, effectName);
	
	//Confirm in chat
	if (game.settings.get("ae-to-chat","confirmationMode") === "none") return; //no chat confirmation

	const currentUser = game.userId;
	const gmUsers = game.users.filter(user => user.isGM && user.active);
	const whisperUsers = [];
	
	switch(game.settings.get("ae-to-chat","confirmationMode")){
		case "gmwhisper":
			whisperUsers.push(gmUsers);
			if (gmUsers.includes(currentUser)) break; //don't add the current user to the array if they're already a GM, otherwise go to next step to add them
		default: //if setting is the wrong value, fall back to whisper user only
		case "whisper":
			whisperUsers.push(currentUser);
			break;
		case "public":
			break; //leaving the array of whisper recipients blank keeps the message public
	}

	const chatType = CONST.CHAT_MESSAGE_TYPES.WHISPER;
			
	//make the chat message, and whisper to the person that pressed the button.
	if(content){
		return ChatMessage.create({
			content,
			type: chatType,
			user: currentUser,
			whisper: whisperUsers
		});
	}
}