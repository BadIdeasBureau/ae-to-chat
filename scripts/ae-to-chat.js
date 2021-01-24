
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
	const removeEffectAnchor = html.find("a[name='remove-row']");
	const disableEffectAnchor = html.find("a[name='disable-row']");
	const showInfoEffectAnchor = html.find("a[name='showinfo-row']");

	if (!token || (token && !game.user.isGM)) {
		removeEffectAnchor.parent().hide();
		disableEffectAnchor.parent().hide();
		showInfoEffectAnchor.parent().hide();
	}


	removeEffectAnchor.on("click", event => {
		const anchorHandler = _anchorHandler(event);
		console.log(anchorHandler);
		if (!anchorHandler) return;
		const tokenData = anchorHandler.tokenData;
		const speaker = anchorHandler.speaker;
		const effectId = anchorHandler.effectId;

		//Make a voodoo doll of the token from the incomplete token data
		const token = new Token(tokenData);

		//Use the voodoo doll to delete the effect from the actual token (if it exists).  It is still kinda nonsense that this works, but let's roll with it
		let content = ""                                    
		if(!token.actor.effects.get(effectId)?.delete()){
			content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
		} else {content = `${game.i18n.localize("AE_TO_CHAT.ChatCard.EffectDeleted")} ${effectId}`};

		//Confirm in chat

		const chatUser = game.userId;
		const chatType = CONST.CHAT_MESSAGE_TYPES.WHISPER;
		
		//make the chat message, and whisper to the person that pressed the button.
		return ChatMessage.create({
			content,
			type: chatType,
			user: chatUser,
			whisper: [chatUser]
		});
	});

	disableEffectAnchor.on("click", event => {
		const anchorHandler = _anchorHandler(event);
		if (!anchorHandler) return;
		const tokenData = anchorHandler.tokenData;
		const speaker = anchorHandler.speaker;
		const effectId = anchorHandler.effectId;

		//Make a voodoo doll of the token from the incomplete token data
		const token = new Token(tokenData);

		//Use the voodoo doll to disable the effect from the actual token (if it exists).  It is still kinda nonsense that this works, but let's roll with it
		let content = ""                                    
		if(!token.actor.effects.get(effectId)?.update({disabled: true})){
			content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
		} else {content = `${game.i18n.localize("AE_TO_CHAT.ChatCard.EffectDisabled")} ${effectId}`};

		//Confirm in chat

		const chatUser = game.userId;
		const chatType = CONST.CHAT_MESSAGE_TYPES.WHISPER;
		
		//make the chat message, and whisper to the person that pressed the button.
		return ChatMessage.create({
			content,
			type: chatType,
			user: chatUser,
			whisper: [chatUser]
		});
	});
	
	showInfoEffectAnchor.on("click", event => {
		const anchorHandler = _anchorHandler(event);
		if (!anchorHandler) return;
		const tokenData = anchorHandler.tokenData;
		const speaker = anchorHandler.speaker;
		const effectId = anchorHandler.effectId;

		//Make a voodoo doll of the token from the incomplete token data
		const token = new Token(tokenData);

		//Use the voodoo doll to show the effect from the actual token (if it exists).  It is still kinda nonsense that this works, but let's roll with it
		let content = ""                                    
		if(!token.actor.effects.get(effectId)?.sheet.render(true)){
			content = game.i18n.localize("AE_TO_CHAT.ChatCard.NoEffect")
			//no chat annoucement if successful - the sheet will pop up, which should be obvious

			//Confirm in chat

			const chatUser = game.userId;
			const chatType = CONST.CHAT_MESSAGE_TYPES.WHISPER;
		
			//make the chat message, and whisper to the person that pressed the button.
			return ChatMessage.create({
				content,
				type: chatType,
				user: chatUser,
				whisper: [chatUser]
			});
		}
	});
}

function _anchorHandler(event){
	//takes an event, returns null if either message, speaker, or token are missing, and returns {speaker, tokenData, effectId} otherwise
	//Speaker may not be needed in there, but it's a handy thing that contains a ton of other data, so... might as well
	//Grab all the relevant data from the message
	const effectListItem = event.target.closest("li");
	const effectId = effectListItem.dataset.effectId;
	const messageListItem = effectListItem?.parentElement?.closest("li");
	const messageId = messageListItem?.dataset?.messageId;
	const message = messageId ? game.messages.get(messageId) : null;
	//Check the message still exists (and wonder how they managed to click the button if it didn't)
	if (!message) return null;
	const speaker = message?.data?.speaker;
	//Check the message has a speaker
	if (!speaker) return null;
	const tokenData = game.scenes.get(speaker.scene).data.tokens.find(t => t._id===speaker.token);

	//Make sure the tokenData was fetched (i.e. the token exists)
	if (!tokenData) return null;
	//output speaker and tokenData
	return {speaker: speaker, tokenData: tokenData, effectId: effectId};
}