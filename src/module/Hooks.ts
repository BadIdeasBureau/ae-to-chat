import { warn, error, debug, i18n } from "../ae-to-chat";
import { updateCombatHanfler, effectArray, processEffectArray, _onRenderChatMessage } from "./AeToChat";
import { MODULE_NAME } from "./settings";

export let readyHooks = async () => {

  //set up a hook to add things t the array during the timer
  Hooks.on("createActiveEffect",(actor, effectData) =>{
    if( 
      (game.settings.get(MODULE_NAME, "onApply") === "none") ||
      (game.settings.get(MODULE_NAME,"onApply")=== "player" && !actor.hasPlayerOwner) || 
      !(game.user === game.users.find((u) => u.isGM && u.active)) 
    ) return;
    effectArray.push({actor:actor, effect:effectData}) 
  });

  // setup all the hooks
  Hooks.on("updateCombat", (tracker) =>{
      updateCombatHanfler(tracker);
  });

  Hooks.on("renderChatMessage",(app,html,data) => {
    _onRenderChatMessage(app,html,data);
  });

}

export let initHooks = () => {
  warn("Init Hooks processing");

  //function to set up the timer hook.  TODO:  Make timeout configurable.

  Hooks.once("createActiveEffect",(actor) =>{
    if( 
      (game.settings.get(MODULE_NAME, "onApply") === "none") ||
      (game.settings.get(MODULE_NAME,"onApply")=== "player" && !actor.hasPlayerOwner) || 
      !(game.user === game.users.find((u) => u.isGM && u.active))
    ) return;
      setTimeout(processEffectArray, game.settings.get(MODULE_NAME, "timeout"))
  });

}


