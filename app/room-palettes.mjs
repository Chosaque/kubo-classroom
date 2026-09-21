// Coordinated finishes for the existing Blender room, applied only to room meshes.
export const ROOM_PALETTES={
 midnight:{wall:'#303b5a',floor:'#252d48',wood:'#b08b54',body:'#657497',secondary:'#697c92',accent:'#e8b967',rug:'#414d72',paper:'#fff0d8',ink:'#171e33',screen:'#192c42'},
 cream:{wall:'#f1dfc6',floor:'#c6935e',wood:'#99603d',body:'#bf765e',secondary:'#839c79',accent:'#d6a553',rug:'#b8c4a0',paper:'#fff0d8',ink:'#514739',screen:'#263f46'},
 mint:{wall:'#e0eee3',floor:'#c5ae86',wood:'#a9815c',body:'#568f88',secondary:'#a0c4ae',accent:'#eaa080',rug:'#e4caa7',paper:'#fff4e1',ink:'#344f4b',screen:'#203e48'},
 lavender:{wall:'#e9e0f1',floor:'#b7a0ad',wood:'#896879',body:'#9b80b3',secondary:'#d5a0ad',accent:'#e4c573',rug:'#c9bcdb',paper:'#fff2dc',ink:'#544361',screen:'#353249'}
};
export function roomColorRole(objectName,materialName){
 materialName=materialName.replace(/(?:\.\d+)+$/,'');
 const n=objectName.replaceAll('_',' ').toLowerCase();
 if(/floor|foundation/.test(n))return 'floor';
 if(/wall|plaster|lintel/.test(n))return 'wall';
 if(/rug/.test(n))return 'rug';
 if(/text|legend|line/.test(n)&&!n.includes('screen'))return 'ink';
 if(/handle|knob|dial|hinge|trim|checkbox|button|status|folder tab/.test(n))return 'accent';
 if(/drawer|safe door|door inset|stool seat|mouse mat/.test(n))return 'secondary';
 if(/copper shell/.test(n))return /board/.test(n)?'wood':'body';
 if(/casing|skirting|doorframe|support|stand base/.test(n))return 'wood';
 return ({'QI cocoa walls':'wall','QI copper edge':'wood','QI charcoal':'body','QI slate':'secondary','QI inset black':'ink','Warm oatmeal rug':'rug','QI warm paper':'paper','QI terracotta':'accent','QI sage status':'secondary','QI provided marker':'accent','PC cream enamel':'secondary','PC key legends':'ink','PC deep blue screen':'screen','PC aqua display':'secondary','PC amber display':'accent'})[materialName]||null;
}
