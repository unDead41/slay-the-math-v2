// Import this example from an existing browser app that serves ES modules.
import { mountMapScreen } from '../src/index.mjs';

const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = new URL('../styles/map.css', import.meta.url).href;
document.head.append(stylesheet);

const host = document.createElement('section');
host.setAttribute('aria-label', 'Mathematics Slayer map');
document.body.append(host);

const screen = mountMapScreen(host, {
  seed: 'STM-001',
  stage: 1,
  onRoomInspect(room, map) {
    // Connect this to the host game's room-details UI.
    // Room entry must separately check the host game's progress and map.edges.
    console.log('Inspected:', room.id, room.type, map.seed);
  }
});

export default screen;
