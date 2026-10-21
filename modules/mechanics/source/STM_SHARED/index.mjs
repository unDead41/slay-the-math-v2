import './registry.js';
import './rich-text.js';
export const sharedRichText=globalThis.STMSharedRichText;
export const registryId=sharedRichText.registryId;
export const configureRichText=options=>sharedRichText.configure(options);
