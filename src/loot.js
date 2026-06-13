/* Loot sprites + generation - loaded after data.js and meta.js */

const D2_SPRITES = [{"name":"Aldur's Deception","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Aldurs_Deception.webp"},{"name":"Ancient Armor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Ancient_Armor.webp"},{"name":"Arcanna's Flesh","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Arcannas_Flesh.webp"},{"name":"Arcticfurs","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Arcticfurs.webp"},{"name":"Arkaine's Valor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Arkaines_Valor.webp"},{"name":"Berserker's Hauberk","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Berserkers_Hauberk.webp"},{"name":"Blinkbat's Form","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Blinkbats_Form.webp"},{"name":"Boneflesh","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Boneflesh.webp"},{"name":"Breast Plate","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Breast_Plate.webp"},{"name":"Cathan's Mesh","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Cathans_Mesh.webp"},{"name":"Chain Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Chain_Mail.webp"},{"name":"Corpsemourn","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Corpsemourn.webp"},{"name":"Dark Adherent","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Dark_Adherent.webp"},{"name":"Darkglow","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Darkglow.webp"},{"name":"Duriel's Shell","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Duriels_Shell.webp"},{"name":"Field Plate","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Field_Plate.webp"},{"name":"Full Plate Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Full_Plate_Mail.webp"},{"name":"Goldskin","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Goldskin.webp"},{"name":"Gothic Plate","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Gothic_Plate.webp"},{"name":"Greyform","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Greyform.webp"},{"name":"Griswold's Heart","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Griswolds_Heart.webp"},{"name":"Guardian Angel","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Guardian_Angel.webp"},{"name":"Haemosu's Adamant","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Haemosus_Adamant.webp"},{"name":"Hard Leather Armor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Hard_Leather_Armor.webp"},{"name":"Hawkmail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Hawkmail.webp"},{"name":"Heavenly Garb","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Heavenly_Garb.webp"},{"name":"Iceblink","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Iceblink.webp"},{"name":"Iron Pelt","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Iron_Pelt.webp"},{"name":"Isenhart's Case","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Isenharts_Case.webp"},{"name":"Leather Armor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Leather_Armor.webp"},{"name":"Leviathan","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Leviathan.webp"},{"name":"Light Plate","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Light_Plate.webp"},{"name":"M'avina's Embrace","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Mavinas_Embrace.webp"},{"name":"Milabrega's Robe","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Milabregas_Robe.webp"},{"name":"Natalya's Shadow","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Natalyas_Shadow.webp"},{"name":"Ormus' Robes","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Ormus_Robes.webp"},{"name":"Plate Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Plate_Mail.webp"},{"name":"Quilted Armor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Quilted_Armor.webp"},{"name":"Rattlecage","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Rattlecage.webp"},{"name":"Ring Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Ring_Mail.webp"},{"name":"Rockfleece","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Rockfleece.webp"},{"name":"Sacred Armor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Sacred_Armor.webp"},{"name":"Sazabi's Ghost Liberator","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Sazabis_Ghost_Liberator.webp"},{"name":"Scale Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Scale_Mail.webp"},{"name":"Sigon's Shelter","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Sigons_Shelter.webp"},{"name":"Silks of the Victor","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Silks_of_the_Victor.webp"},{"name":"Skin of the Flayed One","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Skin_of_the_Flayed_One.webp"},{"name":"Skin of the Vipermagi","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Skin_of_the_Vipermagi.webp"},{"name":"Sparking Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Sparking_Mail.webp"},{"name":"Splint Mail","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Splint_Mail.webp"},{"name":"Steel Carapace","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Steel_Carapace.webp"},{"name":"Studded Leather","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Studded_Leather.webp"},{"name":"Tancred's Spine","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Tancreds_Spine.webp"},{"name":"Templar's Might","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Templars_Might.webp"},{"name":"The Centurion","category":"armor","slot":"chest","dataUrl":"/sprites/armor_The_Centurion.webp"},{"name":"The Gladiator's Bane","category":"armor","slot":"chest","dataUrl":"/sprites/armor_The_Gladiators_Bane.webp"},{"name":"Toothrow","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Toothrow.webp"},{"name":"Trang-Oul's Scales","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Trang-Ouls_Scales.webp"},{"name":"Twitchthroe","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Twitchthroe.webp"},{"name":"Tyrael's Might","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Tyraels_Might.webp"},{"name":"Venom Ward","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Venom_Ward.webp"},{"name":"Vidala's Ambush","category":"armor","slot":"chest","dataUrl":"/sprites/armor_Vidalas_Ambush.webp"},{"name":"Amulet 1","category":"jewelry","slot":"amulet","dataUrl":"/sprites/jewelry_Amulet_1.webp"},{"name":"Amulet 2","category":"jewelry","slot":"amulet","dataUrl":"/sprites/jewelry_Amulet_2.webp"},{"name":"Amulet 3","category":"jewelry","slot":"amulet","dataUrl":"/sprites/jewelry_Amulet_3.webp"},{"name":"Aldur's Advance","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Aldurs_Advance.webp"},{"name":"Boots","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Boots.webp"},{"name":"Chain Boots","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Chain_Boots.webp"},{"name":"Goblin Toe","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Goblin_Toe.webp"},{"name":"Gorefoot","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Gorefoot.webp"},{"name":"Greaves","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Greaves.webp"},{"name":"Heavy Boots","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Heavy_Boots.webp"},{"name":"Hotspur","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Hotspur.webp"},{"name":"Light Plated Boots","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Light_Plated_Boots.webp"},{"name":"Natalya's Soul","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Natalyas_Soul.webp"},{"name":"Sander's Riprap","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Sanders_Riprap.webp"},{"name":"Shadow Dancer","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Shadow_Dancer.webp"},{"name":"Tancred's Hobnails","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Tancreds_Hobnails.webp"},{"name":"Tearhaunch","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Tearhaunch.webp"},{"name":"Treads of Cthon","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Treads_of_Cthon.webp"},{"name":"Vidala's Fetlock","category":"boots","slot":"boots","dataUrl":"/sprites/boots_Vidalas_Fetlock.webp"},{"name":"Arcanna's Head","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Arcannas_Head.webp"},{"name":"Berserker's Headgear","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Berserkers_Headgear.webp"},{"name":"Biggin's Bonnet","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Biggins_Bonnet.webp"},{"name":"Bone Helm","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Bone_Helm.webp"},{"name":"Bone Visage","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Bone_Visage.webp"},{"name":"Cap","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Cap.webp"},{"name":"Circlet","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Circlet.webp"},{"name":"Coif of Glory","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Coif_of_Glory.webp"},{"name":"Coronet","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Coronet.webp"},{"name":"Crown","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Crown.webp"},{"name":"Crown of Ages","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Crown_of_Ages.webp"},{"name":"Crown of Thieves","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Crown_of_Thieves.webp"},{"name":"Darksight Helm","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Darksight_Helm.webp"},{"name":"Diadem","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Diadem.webp"},{"name":"Duskdeep","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Duskdeep.webp"},{"name":"Full Helm","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Full_Helm.webp"},{"name":"Giant Skull","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Giant_Skull.webp"},{"name":"Great Helm","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Great_Helm.webp"},{"name":"Griffons Eye","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Griffons_Eye.webp"},{"name":"Guillaume's Face","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Guillaumes_Face.webp"},{"name":"Harlequin Crest","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Harlequin_Crest.webp"},{"name":"Helm","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Helm.webp"},{"name":"Howltusk","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Howltusk.webp"},{"name":"Hwanin's Splendor","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Hwanins_Splendor.webp"},{"name":"Infernal Cranium","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Infernal_Cranium.webp"},{"name":"Isenhart's Horns","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Isenharts_Horns.webp"},{"name":"Kiras Guardian","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Kiras_Guardian.webp"},{"name":"M'avina's True Sight","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Mavinas_True_Sight.webp"},{"name":"Mask","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Mask.webp"},{"name":"Milabrega's Diadem","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Milabregas_Diadem.webp"},{"name":"Natalya's Totem","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Natalyas_Totem.webp"},{"name":"Nightwing's Veil","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Nightwings_Veil.webp"},{"name":"Ondal's Almighty","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Ondals_Almighty.webp"},{"name":"Rockstopper","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Rockstopper.webp"},{"name":"Sander's Paragon","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Sanders_Paragon.webp"},{"name":"Sazabi's Mental Sheath","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Sazabis_Mental_Sheath.webp"},{"name":"Sigon's Visor","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Sigons_Visor.webp"},{"name":"Skull Cap","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Skull_Cap.webp"},{"name":"Steel Shade","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Steel_Shade.webp"},{"name":"Tancred's Skull","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Tancreds_Skull.webp"},{"name":"Tarnhelm","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Tarnhelm.webp"},{"name":"Tiara","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Tiara.webp"},{"name":"Trang-Oul's Guise","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Trang-Ouls_Guise.webp"},{"name":"Undead Crown","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Undead_Crown.webp"},{"name":"Vampire Gaze","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Vampire_Gaze.webp"},{"name":"Veil of Steel","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Veil_of_Steel.webp"},{"name":"Wormskull","category":"helms","slot":"helmet","dataUrl":"/sprites/helms_Wormskull.webp"},{"name":"Arcticmitts","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Arcticmitts.webp"},{"name":"Bloodfist","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Bloodfist.webp"},{"name":"Chain Gloves","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Chain_Gloves.webp"},{"name":"Chance Guards","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Chance_Guards.webp"},{"name":"Cleglaw's Pincers","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Cleglaws_Pincers.webp"},{"name":"Dracul's Grasp","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Draculs_Grasp.webp"},{"name":"Frostburn","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Frostburn.webp"},{"name":"Gauntlets","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Gauntlets.webp"},{"name":"Heavy Gloves","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Heavy_Gloves.webp"},{"name":"Leather Gloves","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Leather_Gloves.webp"},{"name":"Light Gauntlets","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Light_Gauntlets.webp"},{"name":"M'avina's Icy Clutch","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Mavinas_Icy_Clutch.webp"},{"name":"Magefist","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Magefist.webp"},{"name":"Magnus' Skin","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Magnus_Skin.webp"},{"name":"Sander's Taboo","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Sanders_Taboo.webp"},{"name":"Soul Drainer","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Soul_Drainer.webp"},{"name":"The Hand of Broc","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_The_Hand_of_Broc.webp"},{"name":"Trang-Oul's Claws","category":"gloves","slot":"gloves","dataUrl":"/sprites/gloves_Trang-Ouls_Claws.webp"}];
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   D2 SPRITE LOOKUP
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
D2_SPRITES.push(
  { name: 'Small Charm', slot: 'charm', dataUrl: '/sprites/charm_Small_Charm_1.webp' },
  { name: 'Small Charm 2', slot: 'charm', dataUrl: '/sprites/charm_Small_Charm_2.webp' },
  { name: 'Large Charm', slot: 'charm', dataUrl: '/sprites/charm_Large_Charm_1.webp' },
  { name: 'Large Charm 2', slot: 'charm', dataUrl: '/sprites/charm_Large_Charm_2.webp' },
  { name: 'Large Charm 3', slot: 'charm', dataUrl: '/sprites/charm_Large_Charm_3.webp' }
);
const SLOT_TO_SPRITE = {
  helmet: 'helmet', amulet: 'amulet', chest: 'chest',
  gloves: 'gloves', boots: 'boots', charm: 'charm',
};
const _byName = {};
const _bySlot = {};
D2_SPRITES.forEach(s => {
  _byName[s.name.toLowerCase()] = s;
  if (!_bySlot[s.slot]) _bySlot[s.slot] = [];
  _bySlot[s.slot].push(s);
});
function getSpriteUrl(itemName, gameSlot) {
  const spriteSlot = SLOT_TO_SPRITE[gameSlot] || gameSlot;
  const pool = _bySlot[spriteSlot] || [];
  const clean = (itemName || '').split('\n')[0].replace(' (Diablo II)', '').trim().toLowerCase();
  if (_byName[clean]) return _byName[clean].dataUrl;
  const match = pool.find(s => s.name.length > 3 && clean.includes(s.name.toLowerCase()));
  if (match) return match.dataUrl;
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)].dataUrl;
  return null;
}
function spriteImg(url, size) {
  if (!url) return '';
  return `<img src="${url}" width="${size||40}" height="${size||40}" style="object-fit:contain;image-rendering:pixelated;display:block;margin:0 auto 3px" alt="" />`;
}






function ri(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function pick(a) { return a[Math.floor(Math.random()*a.length)]; }

function rollQuality(tidx) {
  const i = Math.min(tidx,9);
  const r = Math.random()*1000;
  const u =  [400,350,250,200,100,60,30,20,10,5];
  const s =  [300,250,200,150,80,50,25,15,8,4];
  const ra = [200,180,150,120,80,50,30,20,12,8];
  const m =  [100,90,80,70,60,50,40,30,20,15];
  if (r < 1000/u[i])                        return 'Unique';
  if (r < 1000/u[i]+1000/s[i])              return 'Set';
  if (r < 1000/u[i]+1000/s[i]+1000/ra[i])   return 'Rare';
  if (r < 1000/u[i]+1000/s[i]+1000/ra[i]+1000/m[i]) return 'Magic';
  return 'Normal';
}

function guessSlot(type) {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t.includes('helm')||t.includes('cap')||t.includes('shako')) return 'helmet';
  if (t.includes('glove')||t.includes('gauntlet'))                 return 'gloves';
  if (t.includes('boot')||t.includes('greave')||t.includes('belt')||t.includes('sash')) return 'boots';
  if (t.includes('amulet'))                                         return 'amulet';
  if (t.includes('armor')||t.includes('plate')||t.includes('mail')) return 'chest';
  return null;
}

function _itemsIdentical(a, b) {
  if (!a || !b) return false;
  if (a.slot !== b.slot || a.name !== b.name) return false;
  const ap = (a.props || []).slice().sort();
  const bp = (b.props || []).slice().sort();
  return ap.length === bp.length && ap.every((v, i) => v === bp[i]);
}

function _equippedInSlot(slot, charmSize) {
  if (!save || !save.equipped) return null;
  if (slot === 'charm') {
    const idx = charmSize === 'large' ? 1 : 0;
    return (save.equipped.charms || [])[idx] || null;
  }
  return save.equipped[slot] || null;
}

const DUPE_GOLD_MULT = { Normal: 1, Magic: 2, Rare: 2, Set: 2.5, Unique: 4, Charm: 3 };

function dropToGoldIfDuplicate(item, score, lvl) {
  if (!item || !item.slot) return item;
  const equipped = _equippedInSlot(item.slot, item.charmSize);
  if (!_itemsIdentical(item, equipped)) return item;
  const mult = DUPE_GOLD_MULT[item.quality] || 1;
  const goldAmt = Math.round(rollBaseGold(score, lvl) * mult);
  return { _goldDrop: true, goldAmt, quality: item.quality, name: item.name, slot: null, rc: RC.Normal };
}

function generateDrop(score, metaTokens, siteTitle) {
  const tidx  = Math.min(Math.floor(score/10), 9);
  const grade = tidx < 3 ? 'normal' : tidx < 7 ? 'exceptional' : 'elite';
  const roll  = Math.random();
  const fb    = siteTitle || 'Unknown';

  if (roll < 0.08) {
    const m = pick(D2MISC);
    const w = pickMeta(metaTokens, fb);
    const isSmall = m.name === 'Small Charm';
    // Charm prop pool — 2 random distinct picks
    const CHARM_GOLD = [
      () => '+' + ri(1,10) + '% Gold Find',
      () => '+' + ri(5,50) + ' Gold Find',
    ];
    const CHARM_LARGE_ONLY = [
      () => '+' + ri(1,15) + '% Double Gold Chance',
      () => '+' + ri(1,5)  + ' Gold per Round',
      () => '+' + ri(5,20) + '% Gold from Elite Kills',
    ];
    const props = isSmall
      ? [pick(CHARM_GOLD)()]
      : [pick(CHARM_GOLD)(), pick(CHARM_LARGE_ONLY)()];
    return { name:m.name+' of '+w, type:'Charm', quality:'Charm', props, icon:'ti-hexagon', slot:'charm', charmSize: isSmall ? 'small' : 'large', rc:RC.Charm };
  }

  const pool    = D2A[grade];
  const base    = pick(pool);
  const quality = rollQuality(tidx);
  const icon    = 'ti-shield';
  const slot    = base.slot || guessSlot(base.type);

  if (quality === 'Unique') {
    const u      = pick(D2UA);
    const flavor = pickMeta(metaTokens, fb);
    return { name:u.name, subtitle:'The '+flavor+' '+u.base, quality:'Unique', props:u.props, icon, slot:u.slot||slot, rc:RC.Unique };
  }
  if (quality === 'Set') {
    const s      = pick(D2SET);
    const flavor = pickMeta(metaTokens, fb);
    return { name:s.name, subtitle:s.set+' - '+flavor+' ed.', quality:'Set', props:s.props, icon, slot:s.slot, rc:RC.Set };
  }
  if (quality === 'Rare') {
    const w1 = pickMeta(metaTokens, fb);
    const w2 = pickMeta(metaTokens.filter(t=>t!==w1), fb);
    const allA = [...MPRE,...MSUF];
    const props = [];
    for (let i=0; i<ri(3,5); i++) { const af = pick(allA); props.push(ri(af.r[0],af.r[1])+' '+af.s); }
    return { name:w1+' '+w2, subtitle:'('+base.name+')', quality:'Rare', props, icon, slot, rc:RC.Rare };
  }
  if (quality === 'Magic') {
    const pre = pick(MPRE), suf = pick(MSUF);
    const mw  = pickMeta(metaTokens, fb);
    return { name:pre.n+' '+mw+' '+base.name+' '+suf.n, quality:'Magic', props:[ri(pre.r[0],pre.r[1])+' '+pre.s, ri(suf.r[0],suf.r[1])+' '+suf.s], icon, slot, rc:RC.Magic };
  }
  return { name:base.name, quality:'Normal', props:['Def: '+base.def+(base.str ? ' - Str: '+base.str : '')], icon, slot, rc:RC.Normal };
}
