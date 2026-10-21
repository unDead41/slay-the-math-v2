const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const raw=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/scores.json'),'utf8'));
const tracks=Array.isArray(raw)?raw:raw.tracks;
if(!Array.isArray(tracks))throw new Error('Invalid soundtrack manifest');
fs.writeFileSync(path.join(root,'dist/music-data.js'),'// Generated from assets/music/scores.json.\nwindow.DCMusicLibrary='+JSON.stringify(tracks.map(({id,title,duration,bpm,key,mood})=>({id,title,duration,bpm,key,mood})))+';\n');
console.log('Music catalog: '+tracks.length+' tracks');
