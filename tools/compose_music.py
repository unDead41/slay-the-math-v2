#!/usr/bin/env python3
"""Deterministic original chamber-dungeon RPG score for Slay the Math.

All oscillators, envelopes, percussion, room response and notation are generated
here. No recordings, external samples, soundfonts or borrowed melodies are used.
Usage: python tools/compose_music.py [--only menu,stage1_dungeon] [--force]

The composer wraps every released note and every reverb tail around the exact
whole-bar loop. Audio files are encoded for browser playback. The accompanying
scores.json contains the complete repeatable note/percussion event score and
the measured encoded-file properties, rather than only descriptive prompts.
"""
from __future__ import annotations

import argparse
import functools
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile

import numpy as np
from scipy import signal
from scipy.io import wavfile

RATE = 44100
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist/assets/music"
VERSION = "stm-chamber-score-1.0"
PITCH = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def midi(value):
    if isinstance(value, int):
        return value
    match = re.fullmatch(r"([A-G])([#b]?)([0-8])", value)
    name, accidental, octave = match.groups()
    return 12 * (int(octave) + 1) + PITCH[name] + (1 if accidental == "#" else -1 if accidental == "b" else 0)


def chord(*notes):
    return [midi(n) for n in notes]


CHORDS = {
    "Dm9": chord("D3", "A3", "C4", "E4", "F4"),
    "Dm": chord("D3", "A3", "D4", "F4", "A4"),
    "Bbmaj7": chord("Bb2", "F3", "A3", "D4", "F4"),
    "Gm9": chord("G2", "D3", "A3", "Bb3", "F4"),
    "Gm": chord("G2", "D3", "G3", "Bb3", "D4"),
    "A7": chord("A2", "E3", "G3", "C#4", "E4"),
    "Fmaj7": chord("F2", "C3", "E3", "A3", "C4"),
    "C": chord("C3", "G3", "C4", "E4", "G4"),
    "Cm9": chord("C3", "G3", "Bb3", "D4", "Eb4"),
    "Cm": chord("C3", "G3", "C4", "Eb4", "G4"),
    "Abmaj7": chord("Ab2", "Eb3", "G3", "C4", "Eb4"),
    "Fm": chord("F2", "C3", "F3", "Ab3", "C4"),
    "G7": chord("G2", "D3", "F3", "B3", "D4"),
    "Eb": chord("Eb3", "Bb3", "Eb4", "G4", "Bb4"),
    "Bb": chord("Bb2", "F3", "Bb3", "D4", "F4"),
    "Em9": chord("E3", "B3", "D4", "F#4", "G4"),
    "Em": chord("E3", "B3", "E4", "G4", "B4"),
    "Cmaj7": chord("C3", "G3", "B3", "E4", "G4"),
    "Am": chord("A2", "E3", "A3", "C4", "E4"),
    "B7": chord("B2", "F#3", "A3", "D#4", "F#4"),
    "D": chord("D3", "A3", "D4", "F#4", "A4"),
    "C/E": chord("E3", "G3", "C4", "E4", "G4"),
    "Dm7": chord("D3", "A3", "C4", "F4", "A4"),
    "Bb6": chord("Bb2", "F3", "G3", "D4", "F4"),
}


def lines(s):
    return [bar.strip() for bar in s.strip().split("|")]


# Handwritten melodic phrases. '-' denotes a rest; values are quarter-note beats.
# A and B phrases deliberately differ in contour, register, rhythm and cadence.
TRACKS = [
    dict(id="menu", title="The Door Below", bpm=80, key="D minor", bars=24,
         mood="A calm, curious dungeon entrance; a returning flute theme over harp and strings.",
         profile="menu", seed=4101,
         progression=["Dm9", "Bbmaj7", "Fmaj7", "C", "Gm9", "Dm9", "Bbmaj7", "A7"],
         melody_a=lines("D5:1.5 A4:0.5 F5:1 E5:1 | D5:2 -:0.5 C5:0.5 A4:1 | A4:1 C5:1 E5:1 G5:1 | E5:2 D5:1 C5:1 | D5:1 F5:1 A5:1 G5:1 | F5:1.5 E5:0.5 D5:2 | F5:1 D5:1 C5:1 Bb4:1 | A4:1 C#5:1 E5:1 -:1"),
         melody_b=lines("A5:1 G5:1 F5:1 E5:1 | D5:1 F5:1 A5:2 | G5:1 E5:1 C5:1 A4:1 | G4:1 C5:1 E5:2 | F5:1.5 D5:0.5 Bb4:1 A4:1 | F5:1 E5:1 D5:2 | D5:1 F5:1 E5:1 D5:1 | C#5:1 A4:1 -:2")),
    dict(id="stage1_dungeon", title="Lanterns in the Stone", bpm=92, key="D minor", bars=24,
         mood="Exploration in an old stone dungeon; gentle movement, warm lanterns and restrained tension.",
         profile="dungeon1", seed=4102,
         progression=["Dm9", "Bbmaj7", "Gm9", "A7", "Dm", "Fmaj7", "C", "A7"],
         melody_a=lines("-:0.5 D5:0.5 F5:1 A5:1 G5:1 | F5:1 D5:1 -:1 A4:1 | Bb4:1 D5:0.5 F5:0.5 G5:1 F5:1 | E5:1 C#5:1 A4:1 -:1 | D5:1 A4:0.5 D5:0.5 F5:1 E5:1 | C5:1.5 A4:0.5 C5:2 | G4:1 C5:1 E5:1 D5:1 | C#5:1 E5:0.5 D5:0.5 A4:1 -:1"),
         melody_b=lines("F5:1 E5:0.5 D5:0.5 A4:2 | Bb4:1 D5:1 F5:2 | G5:1 F5:1 D5:1 Bb4:1 | A4:1 C#5:1 E5:2 | A5:1 F5:1 E5:1 D5:1 | C5:1 A4:1 G4:1 A4:1 | G4:1 C5:1 E5:1 G5:1 | E5:1 C#5:1 A4:1 -:1")),
    dict(id="stage2_dungeon", title="Halls of the Hidden Seal", bpm=106, key="C minor", bars=24,
         mood="A deeper dungeon with cooler shadows; low strings, quiet clockwork pulse and glass bells.",
         profile="dungeon2", seed=4103,
         progression=["Cm9", "Abmaj7", "Fm", "G7", "Eb", "Bb", "Abmaj7", "G7"],
         melody_a=lines("C5:1.5 Eb5:0.5 D5:1 G4:1 | Ab4:1 C5:1 Eb5:1 -:1 | C5:0.5 Ab4:0.5 C5:1 F5:1 Eb5:1 | D5:1 B4:1 G4:2 | Bb4:1 G4:1 Eb5:1 D5:1 | F5:1 D5:1 Bb4:1 -:1 | C5:1 Eb5:1 G5:1 Eb5:1 | D5:1 B4:1 G4:1 -:1"),
         melody_b=lines("G5:1 Eb5:1 D5:1 C5:1 | Eb5:1 C5:1 Ab4:2 | Ab5:1 G5:0.5 F5:0.5 Eb5:1 C5:1 | D5:1 G5:1 F5:1 D5:1 | G5:1 Bb5:1 G5:1 Eb5:1 | F5:1 D5:1 Bb4:2 | Eb5:1 C5:1 G4:1 Ab4:1 | B4:1 D5:1 G4:1 -:1")),
    dict(id="stage1_elite", title="The Iron Warden", bpm=118, key="D minor", bars=28,
         mood="A disciplined elite fight; plucked strings, low hand drums and a determined reed melody.",
         profile="elite1", seed=4104,
         progression=["Dm", "Dm9", "Bbmaj7", "A7", "Gm", "Dm", "Bbmaj7", "A7"],
         melody_a=lines("D5:0.75 A4:0.25 D5:1 F5:1 E5:1 | D5:0.5 F5:0.5 A5:1 F5:1 D5:1 | Bb4:0.75 D5:0.25 F5:1 D5:1 Bb4:1 | A4:0.5 C#5:0.5 E5:1 G5:1 E5:1 | G5:1 D5:0.5 Bb4:0.5 D5:1 F5:1 | A5:1 F5:1 D5:1 -:1 | F5:0.5 D5:0.5 Bb4:1 D5:1 F5:1 | E5:0.75 C#5:0.25 A4:1 -:2"),
         melody_b=lines("A5:1 F5:0.5 E5:0.5 D5:1 A4:1 | F5:1 E5:1 D5:2 | D5:0.5 F5:0.5 Bb5:1 A5:1 F5:1 | E5:1 C#5:1 A4:1 E5:1 | Bb5:1 A5:1 G5:1 D5:1 | F5:0.5 A5:0.5 F5:1 E5:1 D5:1 | D5:1 F5:1 Bb5:1 A5:1 | G5:1 E5:1 C#5:1 -:1")),
    dict(id="stage2_elite", title="The Obsidian Sentinel", bpm=134, key="C minor", bars=32,
         mood="A faster elite encounter; syncopated cello, darker brass-like reeds and precise drums.",
         profile="elite2", seed=4105,
         progression=["Cm", "Abmaj7", "Cm9", "G7", "Fm", "Abmaj7", "Bb", "G7"],
         melody_a=lines("C5:0.5 -:0.5 G5:0.75 Eb5:0.25 D5:1 C5:1 | Eb5:1 C5:0.5 Ab4:0.5 C5:1 -:1 | G5:0.5 Eb5:0.5 C5:1 D5:0.5 Eb5:0.5 G5:1 | F5:1 D5:1 B4:1 -:1 | F5:0.5 C5:0.5 Ab5:1 G5:0.5 F5:0.5 Eb5:1 | Eb5:1 C5:1 Ab4:0.5 C5:0.5 Eb5:1 | F5:1 Bb5:1 A5:1 F5:1 | D5:0.5 B4:0.5 G4:1 D5:1 -:1"),
         melody_b=lines("Eb5:0.5 G5:0.5 C6:1 Bb5:1 G5:1 | Ab5:1 G5:1 Eb5:1 C5:1 | D5:0.5 Eb5:0.5 G5:1 Eb5:0.5 D5:0.5 C5:1 | B4:1 D5:1 F5:1 G5:1 | Ab5:1 F5:1 Eb5:1 C5:1 | C5:0.5 Eb5:0.5 Ab5:1 G5:1 Eb5:1 | D5:1 F5:1 Bb5:1 A5:1 | G5:1 F5:1 D5:1 B4:1")),
    dict(id="stage1_boss", title="Keeper of the First Gate", bpm=124, key="D minor", bars=32,
         mood="The first boss; a broad rising theme, layered strings, horns and measured low drums.",
         profile="boss1", seed=4106,
         progression=["Dm", "Bbmaj7", "Gm", "A7", "Fmaj7", "C", "Bbmaj7", "A7"],
         melody_a=lines("D5:1 A4:1 D5:1 F5:1 | Bb5:1 A5:1 F5:2 | G5:1 D5:1 Bb4:1 D5:1 | E5:1 G5:1 E5:1 C#5:1 | F5:1 A5:1 C6:1 A5:1 | G5:1 E5:1 C5:2 | D5:1 F5:1 Bb5:1 A5:1 | G5:1 E5:1 C#5:1 -:1"),
         melody_b=lines("A5:1 A5:0.5 G5:0.5 F5:1 E5:1 | F5:1 D5:1 Bb4:2 | Bb5:1 A5:1 G5:1 F5:1 | E5:1 C#5:1 A4:1 -:1 | C6:1 A5:1 G5:1 F5:1 | E5:1 G5:1 E5:1 C5:1 | Bb5:1 A5:1 F5:1 D5:1 | E5:1 C#5:1 A4:2")),
    dict(id="stage2_boss", title="The Last Equation", bpm=140, key="C minor", bars=36,
         mood="The final boss; a strong original theme, moving cello, resonant drums and controlled urgency.",
         profile="boss2", seed=4107,
         progression=["Cm", "Abmaj7", "Fm", "G7", "Cm9", "Bb", "Abmaj7", "G7"],
         melody_a=lines("C5:0.5 G5:0.5 C6:1 Bb5:1 G5:1 | Ab5:1 G5:1 Eb5:1 C5:1 | F5:0.5 Ab5:0.5 C6:1 Ab5:1 F5:1 | G5:1 F5:1 D5:1 B4:1 | C5:0.5 Eb5:0.5 G5:1 C6:1 Bb5:1 | Bb5:1 F5:1 D5:1 F5:1 | Ab5:0.5 G5:0.5 Eb5:1 C5:1 Eb5:1 | D5:1 B4:1 G4:1 -:1"),
         melody_b=lines("G5:1 C6:1 G5:0.5 Eb5:0.5 D5:1 | Eb5:1 Ab5:1 G5:1 Eb5:1 | Ab5:0.5 C6:0.5 Ab5:1 G5:1 F5:1 | D5:1 F5:1 G5:1 B5:1 | C6:1 G5:1 Eb5:1 D5:1 | F5:0.5 Bb5:0.5 F5:1 D5:1 Bb4:1 | C5:1 Eb5:1 Ab5:1 G5:1 | F5:0.5 D5:0.5 B4:1 G4:2")),
    dict(id="rest", title="A Fire and a Small Hope", bpm=68, key="F major / D minor", bars=20,
         mood="A safe rest room; warm harp, low strings and a gentle, spacious flute with no battle drums.",
         profile="rest", seed=4108,
         progression=["Fmaj7", "C/E", "Dm7", "Bb6", "Fmaj7", "C/E", "Bb6", "C"],
         melody_a=lines("A4:2 C5:1 A4:1 | G4:2 -:1 E4:1 | F4:1 A4:1 D5:2 | C5:2 Bb4:1 G4:1 | A4:1 C5:1 E5:2 | D5:1 C5:1 G4:2 | F4:1 G4:1 Bb4:1 A4:1 | G4:2 -:2"),
         melody_b=lines("C5:2 A4:1 G4:1 | E4:1 G4:1 C5:2 | D5:1 C5:1 A4:1 F4:1 | G4:2 F4:2 | A4:2 C5:2 | E5:1 D5:1 C5:2 | Bb4:1 A4:1 G4:1 F4:1 | E4:2 G4:2")),
    dict(id="shop", title="Coins by Candlelight", bpm=104, key="G minor", bars=28,
         mood="A friendly dungeon merchant; bouncing lute, pizzicato bass and a light celesta tune.",
         profile="shop", seed=4109,
         progression=["Gm", "Eb", "Bb", "D", "Gm9", "C", "Eb", "D"],
         melody_a=lines("G4:0.5 Bb4:0.5 D5:1 Bb4:0.5 A4:0.5 G4:1 | G4:1 Bb4:0.5 Eb5:0.5 D5:1 Bb4:1 | F5:0.5 D5:0.5 Bb4:1 D5:1 F5:1 | E5:0.5 F#5:0.5 A5:1 F#5:1 D5:1 | Bb4:0.5 D5:0.5 G5:1 F5:0.5 D5:0.5 Bb4:1 | C5:1 E5:0.5 G5:0.5 E5:1 C5:1 | Bb4:0.5 G4:0.5 Eb5:1 D5:1 Bb4:1 | A4:1 F#4:1 D4:1 -:1"),
         melody_b=lines("D5:0.5 G5:0.5 Bb5:1 A5:1 G5:1 | G5:1 Eb5:0.5 D5:0.5 Bb4:2 | D5:0.5 F5:0.5 Bb5:1 A5:1 F5:1 | F#5:0.5 E5:0.5 D5:1 A4:2 | D5:1 Bb4:0.5 G4:0.5 A4:1 Bb4:1 | E5:1 G5:0.5 E5:0.5 C5:2 | Eb5:1 D5:1 Bb4:0.5 G4:0.5 Bb4:1 | A4:1 F#4:1 D4:2")),
    dict(id="mystery", title="A Question Behind the Wall", bpm=76, key="E minor", bars=20,
         mood="An unknown event; soft glass bells, suspended harp and a questioning bass-flute answer.",
         profile="mystery", seed=4110,
         progression=["Em9", "Cmaj7", "Am", "B7", "Em", "Cmaj7", "Am", "B7"],
         melody_a=lines("E5:1 -:0.5 B5:0.5 G5:1 F#5:1 | E5:1 B4:1 -:1 G5:1 | A5:1 E5:1 C5:1 -:1 | D#5:1 F#5:1 B4:1 -:1 | E5:0.5 G5:0.5 B5:1 G5:1 E5:1 | D5:1 E5:1 G5:2 | C5:1 E5:1 A5:1 G5:1 | F#5:1 D#5:1 B4:1 -:1"),
         melody_b=lines("B5:1 G5:1 F#5:1 E5:1 | G5:1 E5:1 B4:2 | E5:1 C5:1 A4:1 C5:1 | D#5:1 F#5:1 A5:1 -:1 | G5:1 E5:1 B4:2 | E5:1 G5:1 B5:2 | A5:1 G5:1 E5:1 C5:1 | D#5:1 B4:1 -:2")),
]


def event(events, ins, note, at, dur, gain, pan=0, variant=0):
    events.append(dict(instrument=ins, midi=int(note), start_beat=round(at, 5),
                       duration_beats=round(dur, 5), gain=round(gain, 5),
                       pan=round(pan, 4), variant=int(variant)))


def score(track):
    """Arrange different A, A', B and return sections for all ten rooms."""
    events = []
    p = track["profile"]
    battle = p.startswith("elite") or p.startswith("boss")
    strong = p in ("elite2", "boss1", "boss2")
    rng = np.random.default_rng(track["seed"])
    for bar in range(track["bars"]):
        section = bar // 8
        index = bar % 8
        notes = CHORDS[track["progression"][index]]
        beat = bar * 4
        # Section B opens the orchestration; the return reduces density again.
        intensity = [0.87, 0.96, 1.04, 0.94, 0.91][min(section, 4)]
        if p == "rest":
            intensity *= 0.84
        if p == "mystery":
            intensity *= 0.82

        # A warm, breathing string harmony. Voicing has an intentionally open root.
        pad_gain = 0.071 if not battle else 0.060
        if p == "rest":
            pad_gain = 0.066
        if p == "shop":
            pad_gain = 0.039
        for voice, n in enumerate([notes[1], notes[3], notes[4]]):
            event(events, "strings", n, beat + voice * 0.025, 3.86,
                  pad_gain * intensity * (0.88 if voice == 2 else 1),
                  [-0.55, 0.27, 0.63][voice], voice % 2)

        # Fingered bass is audible on small speakers without a boomy sine drone.
        bass_ins = "pizz" if p == "shop" else "bass"
        bass_root = notes[0] - (12 if notes[0] >= 48 else 0)
        bass_pattern = [(0, bass_root, 1.65), (2, notes[1] - 12, 1.65)]
        if p in ("rest", "mystery", "menu"):
            bass_pattern = [(0, bass_root, 3.4)]
        if battle:
            bass_pattern = [(0, bass_root, 0.78), (1.5, bass_root, 0.43),
                            (2, notes[1] - 12, 0.8), (3, bass_root, 0.75)]
        for position, n, length in bass_pattern:
            event(events, bass_ins, n, beat + position, length,
                  (0.18 if battle else 0.155) * intensity, -0.03, bar % 2)

        # Distinct accompaniment patterns, with humanized pluck timing/velocity.
        if p == "rest":
            arp = [(0, 1), (1, 3), (2, 4), (3, 3)]
            arp_ins, arp_gain = "harp", 0.14
        elif p == "mystery":
            arp = [(0.5, 1), (1.75, 3), (2.5, 4), (3.5, 2)]
            arp_ins, arp_gain = "harp", 0.095
        elif p == "shop":
            arp = [(0.5, 2), (1, 4), (1.5, 3), (2.5, 2), (3, 4), (3.5, 3)]
            arp_ins, arp_gain = "lute", 0.145
        elif p in ("elite2", "boss2"):
            arp = [(0, 1), (0.5, 3), (1, 1), (1.5, 4), (2, 2), (2.5, 3), (3, 1), (3.5, 4)]
            arp_ins, arp_gain = "pizz", 0.125
        elif p in ("elite1", "boss1"):
            arp = [(0, 1), (0.5, 3), (1.5, 4), (2, 2), (2.5, 3), (3.5, 4)]
            arp_ins, arp_gain = "lute", 0.135
        elif p == "dungeon2":
            arp = [(0, 1), (0.75, 3), (1.5, 4), (2, 2), (2.75, 3), (3.5, 4)]
            arp_ins, arp_gain = "pizz", 0.115
        else:
            arp = [(0, 1), (0.5, 3), (1, 4), (1.5, 3), (2, 2), (2.5, 3), (3, 4), (3.5, 3)]
            arp_ins, arp_gain = "harp" if p == "menu" else "lute", 0.115
        if section == 2:
            arp = [(pos, v if j % 3 else min(v + 1, 4)) for j, (pos, v) in enumerate(arp)]
        for j, (position, voice) in enumerate(arp):
            n = notes[voice] + (12 if p in ("rest", "menu", "mystery") else 0)
            n += 12 if section == 1 and j == len(arp) - 1 and p in ("menu", "dungeon1", "shop") else 0
            event(events, arp_ins, n, beat + position + float(rng.uniform(0.001, 0.015)),
                  0.7 if battle else 1.28, arp_gain * intensity * float(rng.uniform(0.83, 1.08)),
                  -0.32 if j % 2 == 0 else 0.33, j % 3)

        # Sparse high bell points mark phrase endings and room identity.
        if p in ("dungeon2", "mystery") and index % 2 == 0:
            event(events, "celesta", notes[3] + 24, beat + 0.02, 1.1,
                  0.070 * intensity, -0.44, index % 3)
        if p == "menu" and section > 0 and index in (0, 3, 6):
            event(events, "celesta", notes[4] + 12, beat + 2.5, 0.8, 0.067, 0.48)

        # Deliberate melodic phrase selection: A, ornamented A, B, quiet return.
        phrase = track["melody_b"] if section in (2, 3) and p == "boss2" or section == 2 else track["melody_a"]
        melody = phrase[index]
        lead = "celesta" if p in ("shop", "mystery") else "reed" if p.startswith("elite") else "horn" if p.startswith("boss") else "flute"
        lead_gain = 0.16 if lead == "celesta" else 0.18 if lead == "horn" else 0.171
        cursor = 0.0
        for token in melody.split():
            name, value = token.split(":")
            duration = float(value)
            if name != "-":
                n = midi(name)
                dur = max(0.12, duration * (0.86 if battle else 0.92))
                event(events, lead, n, beat + cursor + 0.014,
                      dur, lead_gain * intensity * float(rng.uniform(0.91, 1.05)), 0.06, (bar + int(cursor * 2)) % 3)
                # A' brings a soft octave echo; B broadens with quiet strings.
                if section == 1 and cursor < 2 and duration >= 1 and p not in ("shop", "rest", "mystery"):
                    event(events, "celesta", n + (0 if n >= 81 else 12), beat + cursor + 0.51,
                          min(duration * 0.6, 0.8), 0.045 * intensity, -0.48, bar % 2)
                if section == 2 and duration >= 1 and p in ("boss1", "boss2", "elite2"):
                    event(events, "strings", n - 12, beat + cursor + 0.01, dur,
                          0.055, -0.42, bar % 2)
            cursor += duration
        if abs(cursor - 4) > 0.001:
            raise ValueError(f"Bad bar ({track['id']}, {bar}): {cursor} beats")

        # Hand percussion changes each section without dominating maths reading.
        if p not in ("rest", "mystery", "menu"):
            drums = [(0, "lowdrum", 0.115), (2, "frame", 0.052)]
            if p == "dungeon1":
                drums = [(0, "lowdrum", 0.050), (2.5, "frame", 0.030)]
            if p == "dungeon2":
                drums = [(0, "lowdrum", 0.075), (1.75, "frame", 0.032), (3, "frame", 0.034)]
            if p == "shop":
                drums = [(1, "frame", 0.027), (3, "frame", 0.027)]
            if strong:
                drums += [(1.5, "lowdrum", 0.066), (3, "frame", 0.047)]
            if battle and index in (3, 7):
                drums += [(3.25, "tom", 0.042), (3.5, "tom", 0.052), (3.75, "frame", 0.035)]
            for position, ins, gain in drums:
                event(events, ins, 43 if ins == "lowdrum" else 53, beat + position,
                      0.38, gain * intensity, -0.15 if ins == "tom" else 0.08, (bar + int(position * 4)) % 3)
            shaker_step = 0.5 if battle or p == "shop" else 1.0
            for j, position in enumerate(np.arange(0.5, 4, shaker_step)):
                event(events, "shaker", 0, beat + float(position), 0.12,
                      (0.014 if p == "shop" else 0.016) * (0.65 if j % 2 else 1) * intensity,
                      0.52 if j % 2 else -0.45, j % 3)
        if p == "mystery" and index in (1, 5):
            event(events, "windchime", notes[4] + 12, beat + 3, 1.8, 0.046, 0.52, bar % 3)
    return sorted(events, key=lambda e: (e["start_beat"], e["instrument"], e["midi"]))


def gate(t, sustain, attack, release):
    env = np.minimum(t / max(attack, 0.0001), 1.0)
    env *= np.where(t <= sustain, 1.0, np.maximum(0, 1 - (t - sustain) / release) ** 2)
    return env


def deterministic_seed(*parts):
    return int.from_bytes(hashlib.sha256("/".join(map(str, parts)).encode()).digest()[:8], "little")


@functools.lru_cache(maxsize=512)
def instrument(ins, pitch, seconds, variant):
    """Render a note with harmonic movement, body colour and quiet acoustic noise."""
    rng = np.random.default_rng(deterministic_seed(ins, pitch, seconds, variant))
    f = 440 * 2 ** ((pitch - 69) / 12)
    release = {"lute": 0.9, "harp": 1.55, "pizz": 0.36,
               "celesta": 1.65, "windchime": 2.1, "strings": 0.40,
               "bass": 0.30, "flute": 0.17, "reed": 0.14, "horn": 0.22}.get(ins, 0.35)
    if ins in ("lowdrum", "tom", "frame", "shaker"):
        release = 0.45
    t = np.arange(round((seconds + release) * RATE), dtype=np.float64) / RATE
    x = np.zeros_like(t)
    if ins in ("harp", "lute", "pizz"):
        decay = {"harp": 1.65, "lute": 0.82, "pizz": 0.39}[ins]
        cutoff = {"harp": 9, "lute": 14, "pizz": 10}[ins]
        position = {"harp": 0.19, "lute": 0.23, "pizz": 0.29}[ins] + variant * 0.006
        for h in range(1, cutoff + 1):
            if h * f > RATE * 0.44:
                break
            amp = (math.sin(math.pi * h * position) / h ** 1.35)
            # Stiffness inharmonicity is subtle, unlike synthetic pure beeps.
            stretch = 1 + (0.000055 if ins == "harp" else 0.000018) * h * h
            harmonic_env = np.exp(-t * (0.75 + h * 0.22) / decay)
            x += amp * np.sin(2 * np.pi * f * h * stretch * t + h * 0.13) * harmonic_env
        attack_noise = rng.standard_normal(len(t))
        attack_noise = signal.sosfilt(signal.butter(1, [450, 3100], "bandpass", fs=RATE, output="sos"), attack_noise)
        x += 0.035 * attack_noise * np.exp(-t / 0.013)
        x *= gate(t, seconds, 0.006, release)
    elif ins in ("celesta", "windchime"):
        ratios = [1, 2.001, 2.756, 5.405, 8.931] if ins == "celesta" else [1, 2.67, 4.19, 5.82]
        amps = [0.76, 0.17, 0.10, 0.045, 0.015] if ins == "celesta" else [0.74, 0.18, 0.07, 0.02]
        for h, (ratio, amp) in enumerate(zip(ratios, amps)):
            if ratio * f > RATE * 0.44:
                continue
            x += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * (0.8 + h * 0.56) / 1.5)
        x *= gate(t, seconds, 0.004, release)
    elif ins == "strings":
        # Three subtly detuned bow voices; upper partials soften during sustain.
        for voice, detune in enumerate([-0.0021, 0.0002, 0.0023]):
            vib = (0.00085 + voice * 0.00013) * np.sin(2 * np.pi * (4.65 + voice * 0.18) * t + voice)
            phase = 2 * np.pi * f * ((1 + detune) * t + vib / 30)
            for h in range(1, 11):
                if h * f > RATE * 0.43:
                    break
                amp = 0.26 / (h ** 1.38) * math.exp(-h * f / 4600)
                x += amp * np.sin(h * phase + 0.31 * voice + 0.05 * h)
        breath = signal.sosfilt(signal.butter(1, [350, 2400], "bandpass", fs=RATE, output="sos"), rng.standard_normal(len(t)))
        x += breath * 0.006
        x *= gate(t, seconds, 0.17 + variant * 0.014, release)
        x *= 0.96 + 0.04 * np.sin(2 * np.pi * 0.75 * t + variant)
    elif ins in ("flute", "reed", "horn"):
        vib_amount = {"flute": 0.0018, "reed": 0.0011, "horn": 0.0008}[ins]
        # Integrate vibrato rather than modulating pitch by t (avoids wild sweeps).
        vib_rate = 4.8 + variant * 0.16
        vib_ramp = np.minimum(t / 0.28, 1)
        phase = 2 * np.pi * f * t - f * vib_amount / vib_rate * np.cos(2 * np.pi * vib_rate * t) * vib_ramp
        partials = {"flute": [1, 0.055, 0.12, 0.035, 0.025, 0.008],
                    "reed": [0.76, 0.18, 0.25, 0.075, 0.11, 0.045, 0.035],
                    "horn": [0.71, 0.32, 0.19, 0.095, 0.055, 0.025]}[ins]
        for h, amp in enumerate(partials, 1):
            x += amp * math.exp(-h * f / (6500 if ins == "flute" else 4700)) * np.sin(h * phase + 0.05 * h)
        noise = signal.sosfilt(signal.butter(2, [750, 4500], "bandpass", fs=RATE, output="sos"), rng.standard_normal(len(t)))
        x += (0.022 if ins == "flute" else 0.011) * noise
        x *= gate(t, seconds, 0.065 if ins == "flute" else 0.045, release)
        x *= 0.97 + 0.03 * np.sin(2 * np.pi * (4.6 + variant * 0.12) * t)
    elif ins == "bass":
        for h, amp in enumerate([1, 0.43, 0.23, 0.12, 0.065, 0.027], 1):
            x += amp * np.sin(2 * np.pi * f * h * t + h * 0.05) * np.exp(-t * (0.20 + h * 0.11))
        x *= gate(t, seconds, 0.014, release)
        x *= 0.65
    elif ins in ("lowdrum", "tom"):
        base = 62 if ins == "lowdrum" else 112 + 9 * variant
        # Smooth falling membrane resonance and a quiet mallet transient.
        phase = 2 * np.pi * (base * t + base * 0.65 * 0.038 * (1 - np.exp(-t / 0.038)))
        x = np.sin(phase) * np.exp(-t / (0.21 if ins == "lowdrum" else 0.14))
        x += 0.27 * np.sin(phase * 1.59) * np.exp(-t / 0.080)
        noise = signal.sosfilt(signal.butter(2, 1400, fs=RATE, output="sos"), rng.standard_normal(len(t)))
        x += noise * 0.12 * np.exp(-t / 0.014)
        x *= gate(t, seconds, 0.003, release)
    elif ins == "frame":
        noise = signal.sosfilt(signal.butter(2, [550, 4100], "bandpass", fs=RATE, output="sos"), rng.standard_normal(len(t)))
        x = 0.31 * noise * np.exp(-t / 0.034)
        x += np.sin(2 * np.pi * (185 + 4 * variant) * t) * 0.40 * np.exp(-t / 0.045)
        x += np.sin(2 * np.pi * 302 * t) * 0.20 * np.exp(-t / 0.028)
        x *= gate(t, seconds, 0.002, release)
    elif ins == "shaker":
        noise = signal.sosfilt(signal.butter(2, [3400, 9500], "bandpass", fs=RATE, output="sos"), rng.standard_normal(len(t)))
        x = noise * np.exp(-t / 0.031) * (1 - np.exp(-t / 0.005))
        x *= gate(t, seconds, 0.002, release)
    else:
        raise ValueError(ins)
    # All finite notes end at zero; no note-on or note-off discontinuities.
    fade = min(len(x), 220)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x.astype(np.float32)


def add_wrap(mix, mono, start, gain, pan):
    length = len(mix)
    gains = gain * np.array([math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)])
    # Some long released notes cross a boundary; wrap each finite segment exactly.
    offset = 0
    start %= length
    while offset < len(mono):
        count = min(length - start, len(mono) - offset)
        mix[start:start + count] += mono[offset:offset + count, None] * gains
        offset += count
        start = 0


def room_response(length, seed):
    rng = np.random.default_rng(seed)
    size = int(2.6 * RATE)
    t = np.arange(size) / RATE
    ir = rng.standard_normal(size) * np.exp(-t / 0.48) * np.minimum(t / 0.05, 1)
    ir = signal.sosfilt(signal.butter(2, [180, 5700], "bandpass", fs=RATE, output="sos"), ir)
    ir *= 0.30 / (np.sqrt(np.sum(ir * ir)) + 1e-12)
    for delay, gain in [(0.029, .19), (.047, .135), (.071, .11), (.103, .07), (.149, .05)]:
        ir[int(delay * RATE)] += gain
    padded = np.zeros(length, np.float32)
    padded[:size] = ir
    return np.fft.rfft(padded)


def apply_room(mix, seed, profile):
    wetness = 0.41 if profile in ("mystery", "rest", "menu") else 0.29 if profile.startswith("boss") else 0.34
    # Periodic convolution preserves the complete room tail across the loop seam.
    left = np.fft.rfft(mix[:, 0])
    right = np.fft.rfft(mix[:, 1])
    ir_left = room_response(len(mix), seed + 100)
    ir_right = room_response(len(mix), seed + 200)
    mix[:, 0] += wetness * np.fft.irfft((left * .70 + right * .30) * ir_left, n=len(mix)).astype(np.float32)
    mix[:, 1] += wetness * np.fft.irfft((right * .70 + left * .30) * ir_right, n=len(mix)).astype(np.float32)
    # Remove DC periodically; the mean subtraction has no boundary state.
    mix -= np.mean(mix, axis=0)
    return mix


def ffmpeg(*args):
    result = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", *map(str, args)], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stderr


def loudness(path):
    report = ffmpeg("-i", path, "-af", "loudnorm=I=-23:TP=-2:LRA=11:print_format=json", "-f", "null", "-")
    blocks = re.findall(r"\{[^{}]+\}", report, re.S)
    return json.loads(blocks[-1])


def extend_mp3_gapless_skip(path, prefix_samples):
    """Account for cyclic encoder pre-roll in the standard LAME gapless tag.

    At a few input-length remainders FFmpeg's MP3 muxer caps the final skip
    at one decoded frame, leaving a handful of unwanted samples. Adding a
    cyclic pre-roll avoids that cap. Increasing the encoded initial-delay
    field discards this pre-roll without changing the musical loop length.
    The LAME tag CRC is recalculated after the metadata change.
    """
    data = bytearray(path.read_bytes())
    info = data.find(b"Info", 0, 2048)
    if info < 0:
        info = data.find(b"Xing", 0, 2048)
    if info < 36:
        raise ValueError("MP3 gapless Info/Xing header not found")
    tag = info + 120  # FFmpeg flags: frame count, byte count, TOC, quality.
    if data[tag:tag + 4] not in (b"Lavc", b"LAME"):
        raise ValueError("Unexpected MP3 encoder tag layout")
    value = int.from_bytes(data[tag + 21:tag + 24], "big")
    delay, padding = value >> 12, value & 4095
    if delay + prefix_samples > 4095:
        raise ValueError("MP3 gapless delay exceeds the 12-bit field")
    data[tag + 21:tag + 24] = (((delay + prefix_samples) << 12) | padding).to_bytes(3, "big")
    crc = 0
    for byte in data[info - 36:tag + 34]:
        crc ^= byte
        for _ in range(8):
            crc = (crc >> 1) ^ (0xA001 if crc & 1 else 0)
    data[tag + 34:tag + 36] = crc.to_bytes(2, "big")
    path.write_bytes(data)


def inspect_file(path):
    result = subprocess.run(["ffprobe", "-v", "quiet", "-show_format", "-show_streams", "-of", "json", str(path)], capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    audio = data["streams"][0]
    metric = loudness(path)
    # Decode to measure the real codec seam and compare to a typical single step.
    decoded = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-acodec", "pcm_f32le", "-"], capture_output=True, check=True)
    samples = np.frombuffer(decoded.stdout, dtype=np.float32).reshape(-1, 2)
    diffs = np.diff(samples, axis=0)
    seam_step = float(np.max(np.abs(samples[0] - samples[-1])))
    step_99 = float(np.quantile(np.abs(diffs[::4]), .99))
    edge_ms = round(RATE * .020)
    seam_window = np.concatenate([samples[-edge_ms:], samples[:edge_ms]], axis=0)
    window_peak = float(np.max(np.abs(seam_window)))
    return dict(codec=audio["codec_name"], sample_rate=int(audio["sample_rate"]),
                channels=int(audio["channels"]), decoded_samples=len(samples),
                container_duration=float(data["format"]["duration"]),
                integrated_lufs=float(metric["input_i"]), true_peak_dbfs=float(metric["input_tp"]),
                loudness_range_lu=float(metric["input_lra"]),
                seam_max_sample_step=round(seam_step, 8),
                typical_step_99_percentile=round(step_99, 8),
                seam_step_over_typical_99=round(seam_step / max(step_99, 1e-10), 3),
                seam_40ms_peak=round(window_peak, 7), bytes=path.stat().st_size,
                sha256=hashlib.sha256(path.read_bytes()).hexdigest())


def render(track, events):
    identifier = track["id"]
    total_beats = track["bars"] * 4
    seconds_per_beat = 60 / track["bpm"]
    length = round(total_beats * seconds_per_beat * RATE)
    mix = np.zeros((length, 2), np.float32)
    for ev in events:
        dur = round(ev["duration_beats"] * seconds_per_beat, 5)
        mono = instrument(ev["instrument"], ev["midi"], dur, ev["variant"])
        add_wrap(mix, mono, round(ev["start_beat"] * seconds_per_beat * RATE), ev["gain"], ev["pan"])
    instrument.cache_clear()
    mix = apply_room(mix, track["seed"], track["profile"])
    # Static normalization preserves the original score dynamics and periodicity.
    mix *= 10 ** (-8 / 20) / max(float(np.max(np.abs(mix))), 1e-12)
    with tempfile.TemporaryDirectory(prefix="stm_music_") as temporary:
        wav = Path(temporary) / f"{identifier}.wav"
        wavfile.write(wav, RATE, mix)
        measured = loudness(wav)
        gain_db = min(-23.0 - float(measured["input_i"]), -2.0 - float(measured["input_tp"]))
        mix *= 10 ** (gain_db / 20)
        wavfile.write(wav, RATE, mix)
        # Explicit loop metadata is useful to engines that inspect Vorbis tags.
        common = ["-y", "-i", wav, "-map_metadata", "-1", "-metadata", f"title={track['title']}",
                  "-metadata", "artist=Slay the Math Original Procedural Score",
                  "-metadata", f"comment={VERSION}; generated without external samples",
                  "-metadata", "LOOPSTART=0", "-metadata", f"LOOPEND={length}",
                  "-ar", RATE, "-ac", "2"]
        ffmpeg(*common, "-c:a", "libvorbis", "-q:a", "5", OUT / f"{identifier}.ogg")
        mp3_preroll = 512 if length % 1152 < 47 else 0
        if mp3_preroll:
            wavfile.write(wav, RATE, np.concatenate([mix[-mp3_preroll:], mix], axis=0))
        ffmpeg(*common, "-c:a", "libmp3lame", "-b:a", "160k", "-write_xing", "1", OUT / f"{identifier}.mp3")
        if mp3_preroll:
            extend_mp3_gapless_skip(OUT / f"{identifier}.mp3", mp3_preroll)
    raw_step = float(np.max(np.abs(mix[0] - mix[-1])))
    raw_step_99 = float(np.quantile(np.abs(np.diff(mix[::4], axis=0)), .99))
    return dict(loop_samples=length, duration=round(length / RATE, 7),
                loop_beats=total_beats, loop_bars=track["bars"], beats_per_bar=4,
                bpm=track["bpm"], tempo_bpm=track["bpm"], key=track["key"], mood=track["mood"],
                title=track["title"], id=identifier,
                files={"ogg": f"assets/music/{identifier}.ogg", "mp3": f"assets/music/{identifier}.mp3"},
                provenance="Original deterministic procedural composition and synthesis; no external samples, soundfonts or copied melodies.",
                usage="You may use, modify and distribute these generated tracks in the Slay the Math project. No formal guarantee of exclusive copyright is asserted.",
                seed=track["seed"], progression=track["progression"],
                melody_a=track["melody_a"], melody_b=track["melody_b"],
                score_events=events,
                source_pcm_metrics={"max_sample_step_at_seam": round(raw_step, 8),
                                    "four_sample_step_99_percentile": round(raw_step_99, 8)},
                encoded_metrics={kind: inspect_file(OUT / f"{identifier}.{kind}") for kind in ("ogg", "mp3")})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_file = OUT / "scores.json"
    manifest = json.loads(manifest_file.read_text()) if manifest_file.exists() else {
        "version": VERSION, "sample_rate": RATE, "channels": 2,
        "target_lufs": -23, "target_true_peak_dbfs_maximum": -2,
        "source": "tools/compose_music.py", "license_note": "Original project-specific procedural music; no external samples were used.",
        "loop_note": "Whole-bar periodic PCM with wrapped note/reverb tails. Browser media-element looping may have a small platform-dependent gap; Web Audio decoded buffers support sample-accurate loop playback.",
        "tracks": []}
    for existing in manifest["tracks"]:
        existing.setdefault("bpm", existing.get("tempo_bpm"))
        existing["usage"] = "You may use, modify and distribute these generated tracks in the Slay the Math project. No formal guarantee of exclusive copyright is asserted."
    selected = set(args.only.split(",")) if args.only else {t["id"] for t in TRACKS}
    for track in TRACKS:
        if track["id"] not in selected:
            continue
        if not args.force and any(t["id"] == track["id"] for t in manifest["tracks"]):
            print(f"SKIP {track['id']} (manifest entry exists)", flush=True)
            continue
        print(f"COMPOSE {track['id']} ({track['bpm']} BPM, {track['bars']} bars)", flush=True)
        events = score(track)
        result = render(track, events)
        manifest["tracks"] = [t for t in manifest["tracks"] if t["id"] != track["id"]] + [result]
        order = {t["id"]: i for i, t in enumerate(TRACKS)}
        manifest["tracks"].sort(key=lambda t: order[t["id"]])
        manifest_file.write_text(json.dumps(manifest, indent=2) + "\n")
        metrics = result["encoded_metrics"]
        print(f"READY {track['id']} | {result['duration']:.2f}s | {len(events)} events | OGG {metrics['ogg']['integrated_lufs']} LUFS / {metrics['ogg']['true_peak_dbfs']} dBTP / seam {metrics['ogg']['seam_step_over_typical_99']} | MP3 {metrics['mp3']['integrated_lufs']} LUFS", flush=True)
    manifest_file.write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
