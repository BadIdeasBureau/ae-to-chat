# Active Effects to Chat

A module for Foundry VTT.

At the start of a token's turn, all temporary active effects on the token will be printed to the chat.  The message has controls for each effect (for the GM and token owner(s)) to disable the effect, show the sheet for the effect (which may allow editing depending on the game system and the effect source), or delete the effect.

A confirmation message is shown when an effect is disabled or deleted.  Currently, this is whispered only to the person who clicked the button.

Only enabled temporary effects (i.e. those with a duration, or with the "temporary" flag set in effect data) are shown.  This may be expanded in future.

## Forthcoming Features

  * Configurable confirmation message - either put it in the public chatlog,  whisper to all GMs and the user that clicked it, or just don't show anything.
  * Handling of disabled temporary effects, allowing them to be reenabled.
  * If there is interest, handling of non-temporary active effects (currently not included to keep the size of the chat message manageable).
  * Feel free to request others by posting a new issue

## Compatibility

In principle, this is system independent (provided the system uses Active Effects on actors).  However, I have not tested it outside of dnd5e.

Compatible with Combat Utility Belt and Dynamic Active Effects.

## Support

This is my first module.  There are probably bugs.  There is definitely some jank in the code.  Feel free to ping me in the modules channels on the foundry discord (BadIdeasBureau#7024), or post an issue here, but please do not PM (unless I have somehow introduced a bug that's a security risk and shouldn't be publcily disclosed, but that seems unlikely).

## Attribution

Inspired by similar functionality for conditions in [Combat Utility Belt](https://github.com/death-save/combat-utility-belt).  Code from CUB used with permission from Death Save Development (under separate license, since I prefer not to use the GPL).
